import { useEffect, useRef, useState } from 'react';

// A halftone of real footage, one clip per theme. Light mode prints a
// chrysanthemum in a single ink, like a risograph; dark mode shows a tiger in
// its own colour. Both were shot on black, which keys out to the page.
// One fullscreen quad: each fragment finds its dot cell, samples the video at
// the cell centre, and the cursor bends the grid first so the dots part.

const CLIPS = {
  light: { src: '/motion/flower.mp4', name: 'Chrysanthemum', mono: 1, key: [0.16, 0.34], gain: 1.0 },
  dark: { src: '/motion/tiger.mp4', name: 'Tiger', mono: 0, key: [0.05, 0.2], gain: 1.7 },
};

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
uniform float uZoom;     // fraction of canvas width the video may span
uniform vec3 uBg;
uniform vec3 uInk;
uniform float uMono;     // 1: single ink, 0: the footage's own colour
uniform vec2 uKey;       // luminance range that fades from background to subject
uniform float uGain;

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

  float h = min(uRes.y * 0.94, uZoom * uRes.x / uAspect);
  vec2 size = vec2(h * uAspect, h);
  vec2 origin = vec2((uRes.x - size.x) * 0.5, uRes.y - size.y);
  vec2 uv = (centre - origin) / size;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(uBg, 1.0); return; }

  vec3 c = clamp(texture2D(uVideo, uv).rgb * uGain, 0.0, 1.0);
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  float a = smoothstep(uKey.x, uKey.y, lum);
  a *= smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x) * smoothstep(0.0, 0.06, uv.y);

  // Mono: brightness becomes dot size, so the petals print dense and the
  // shadows between them open up. Colour: dot size from the key alone.
  float detail = smoothstep(0.3, 0.68, lum);
  float tone = uMono > 0.5 ? a * mix(0.12, 1.0, pow(detail, 1.6)) : a;
  // The tiger is lit low: lift the mids and the stripes' orange.
  vec3 warm = pow(c, vec3(0.8));
  warm = mix(vec3(dot(warm, vec3(0.299, 0.587, 0.114))), warm, 1.3);
  vec3 col = uMono > 0.5 ? uInk : clamp(warm, 0.0, 1.0);

  float rad = uCell * 0.5 * mix(0.2, 0.98, tone);
  float m = 1.0 - smoothstep(rad - 1.0, rad, length(q - centre));
  gl_FragColor = vec4(mix(uBg, col, m * step(0.02, tone)), 1.0);
}`;

const CELL = 6; // css px between dot centres

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

// The shader reads its colours from the theme tokens; both must be 6-digit hex.
const token = (name) => {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
};

const resolvedTheme = () => document.documentElement.dataset.theme
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export function Bloom() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [theme, setTheme] = useState(resolvedTheme);
  const clip = CLIPS[theme];

  // Follow the toggle and the system setting.
  useEffect(() => {
    const sync = () => setTheme(resolvedTheme());
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', sync);
    return () => { mo.disconnect(); mq.removeEventListener('change', sync); };
  }, []);

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

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);

    const u = Object.fromEntries(['uRes', 'uMouse', 'uVel', 'uCell', 'uTime', 'uAspect', 'uZoom',
      'uBg', 'uInk', 'uMono', 'uKey', 'uGain'].map((n) => [n, gl.getUniformLocation(prog, n)]));

    const stacked = window.matchMedia('(max-width: 860px)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bg = token('--bg');
    const ink = token('--accent');
    let dpr = 1;
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

    const draw = () => {
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
      gl.uniform1f(u.uAspect, video.videoWidth / video.videoHeight || 1);
      // Stacked layout lets the subject run wider than the canvas so it stays large.
      gl.uniform1f(u.uZoom, stacked.matches ? 1.25 : 0.94);
      gl.uniform3f(u.uBg, ...bg);
      gl.uniform3f(u.uInk, ...ink);
      gl.uniform1f(u.uMono, clip.mono);
      gl.uniform2f(u.uKey, ...clip.key);
      gl.uniform1f(u.uGain, clip.gain);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = () => {
      raf = 0;
      if (video.readyState >= 2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
        hasFrame = true;
      }
      if (hasFrame) draw();
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

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    video.addEventListener('loadeddata', onReady);
    if (video.readyState >= 2) onReady();
    resize();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      video.removeEventListener('loadeddata', onReady);
    };
  }, [clip]);

  return (
    <figure className="bloom">
      <video key={clip.src} ref={videoRef} src={clip.src} muted loop playsInline preload="auto" aria-hidden="true" />
      {/* Remounted per theme so the WebGL context is rebuilt with the new clip. */}
      <canvas key={`c-${clip.src}`} ref={canvasRef} role="img" aria-label={`A ${clip.name.toLowerCase()}, drawn in dots`} />
      <figcaption className="label">{clip.name}. Move through it.</figcaption>
    </figure>
  );
}
