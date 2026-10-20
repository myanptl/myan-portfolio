import { useEffect, useRef } from 'react';

// An alstroemeria time-lapse, opening and closing, drawn as a halftone.
// One fullscreen quad: each fragment finds its dot cell, samples the video at
// the cell centre, and the black studio background keys out to the page.
// The cursor bends the grid before sampling, so the dots part like water.

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform sampler2D uVideo;
uniform vec2 uRes;       // canvas size, device px
uniform vec2 uMouse;     // device px, y down
uniform vec2 uVel;       // smoothed cursor velocity
uniform float uCell;     // dot pitch, device px
uniform float uTime;
uniform float uAspect;   // video w / h
uniform vec3 uBg;
uniform float uZoom;    // how much of the canvas width the video may span

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);

  // Cursor: push outward and drag along the direction of travel.
  vec2 d = p - uMouse;
  float r = uRes.y * 0.16;
  float f = exp(-dot(d, d) / (r * r));
  vec2 disp = normalize(d + 0.001) * f * uCell * 2.2 + uVel * f * 0.9;

  // Wind: a slow, low sway so the field is never perfectly still.
  disp += vec2(sin(p.y * 0.006 + uTime * 0.7), cos(p.x * 0.005 + uTime * 0.55)) * uCell * 0.35;

  vec2 q = p - disp;
  vec2 cell = floor(q / uCell);
  vec2 centre = (cell + 0.5) * uCell;

  // Contain the video in the canvas, anchored to the bottom like a stem in a vase.
  float h = min(uRes.y * 0.92, uZoom * uRes.x / uAspect);
  vec2 size = vec2(h * uAspect, h);
  vec2 origin = vec2((uRes.x - size.x) * 0.5, uRes.y - size.y);
  vec2 uv = (centre - origin) / size;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(uBg, 1.0); return; }

  vec3 c = texture2D(uVideo, uv).rgb;
  float a = smoothstep(0.07, 0.24, max(c.r, max(c.g, c.b)));
  // Feather the sides so a petal touching the frame edge never shows a hard cut.
  a *= smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x);
  // Black-background footage is dim at the edges; lift it, then deepen for paper.
  c = clamp(c / max(0.35, max(c.r, max(c.g, c.b))) * 0.92, 0.0, 1.0);
  c = pow(c, vec3(1.15));
  // Pull the studio-lit greens back a little so the petals lead.
  c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 0.82);

  float rad = uCell * 0.5 * mix(0.25, 0.95, a);
  float m = 1.0 - smoothstep(rad - 1.0, rad, length(q - centre));
  gl_FragColor = vec4(mix(uBg, c, m * a), 1.0);
}`;

const CELL = 6; // css px between dot centres

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

const bgColor = () => {
  const hex = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
};

export function Bloom() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) { canvas.hidden = true; video.classList.add('bloom__fallback'); return undefined; }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);

    const u = Object.fromEntries(['uRes', 'uMouse', 'uVel', 'uCell', 'uTime', 'uAspect', 'uBg', 'uZoom']
      .map((n) => [n, gl.getUniformLocation(prog, n)]));

    const stacked = window.matchMedia('(max-width: 860px)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dpr = 1;
    let bg = bgColor();
    let raf = 0;
    let visible = true;
    let hasFrame = false;
    // Cursor parked off-canvas until it arrives; target vs eased position gives the drag.
    const target = { x: -1e4, y: -1e4 };
    const pos = { x: -1e4, y: -1e4 };
    const vel = { x: 0, y: 0 };
    const t0 = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const frame = () => {
      raf = 0;
      if (video.readyState >= 2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
        hasFrame = true;
      }
      if (hasFrame) {
        const nx = pos.x + (target.x - pos.x) * 0.12;
        const ny = pos.y + (target.y - pos.y) * 0.12;
        vel.x += ((nx - pos.x) * 4 - vel.x) * 0.1;
        vel.y += ((ny - pos.y) * 4 - vel.y) * 0.1;
        pos.x = nx; pos.y = ny;
        gl.uniform2f(u.uRes, canvas.width, canvas.height);
        gl.uniform2f(u.uMouse, pos.x * dpr, pos.y * dpr);
        gl.uniform2f(u.uVel, vel.x * dpr, vel.y * dpr);
        gl.uniform1f(u.uCell, CELL * dpr);
        gl.uniform1f(u.uTime, still ? 0 : (performance.now() - t0) / 1000);
        gl.uniform1f(u.uAspect, video.videoWidth / video.videoHeight || 16 / 9);
        gl.uniform3f(u.uBg, ...bg);
        // Stacked layout crops the sides so the flower stays large.
        gl.uniform1f(u.uZoom, stacked.matches ? 1.3 : 0.94);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if (visible && !still) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const onMove = (e) => {
      const b = canvas.getBoundingClientRect();
      target.x = e.clientX - b.left;
      target.y = e.clientY - b.top;
      if (pos.x < -1e3) { pos.x = target.x; pos.y = target.y; }
      if (still) kick();
    };
    const onLeave = () => { target.x = -1e4; target.y = -1e4; };

    const onReady = () => {
      if (still) {
        // Hold the fully open frame, which sits at the turn of the ping-pong.
        video.pause();
        video.currentTime = video.duration / 2;
        video.addEventListener('seeked', kick, { once: true });
        return;
      }
      video.play().catch(() => {});
      kick();
    };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(canvas);
    const ro = new ResizeObserver(() => { resize(); kick(); });
    ro.observe(canvas);
    const onTheme = () => { bg = bgColor(); kick(); };
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', onTheme);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    video.addEventListener('loadeddata', onReady);
    if (video.readyState >= 2) onReady();
    resize();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); mo.disconnect();
      mq.removeEventListener('change', onTheme);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      video.removeEventListener('loadeddata', onReady);
    };
  }, []);

  return (
    <figure className="bloom">
      <video ref={videoRef} src="/motion/bloom.mp4" muted loop playsInline preload="auto" aria-hidden="true" />
      <canvas ref={canvasRef} role="img" aria-label="An alstroemeria flower opening and closing, drawn in coloured dots" />
      <figcaption className="label">Alstroemeria, time-lapse. Move through it.</figcaption>
    </figure>
  );
}
