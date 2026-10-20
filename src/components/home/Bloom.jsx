import { useEffect, useRef, useState } from 'react';

// Real footage drawn as a halftone, one clip per theme.
// By day the dots are ink: the darker the pixel, the bigger the dot, so the
// dahlia's white studio sweep prints as bare paper. By night the dots are
// light: the brighter the pixel, the bigger the dot, so the panda's white fur
// glows and its black fur all but disappears. Edges feather into the page.
// Nothing reacts to the cursor; the footage is the motion.

const CLIPS = {
  light: { src: '/motion/dahlia.mp4', name: 'Dahlia', ink: 1, feather: 0.04, range: [0.08, 0.8] },
  // The white fur lights up full; grass and dirt sit low in the range and stay faint.
  dark: { src: '/motion/panda.mp4', name: 'Giant panda, lunch', ink: 0, feather: 0.18, range: [0.3, 0.95] },
};

const DEVELOP_MS = 1800; // dots grow in from nothing, like a print developing
const CELL = 6;          // css px between dot centres

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform sampler2D uVideo;
uniform vec2 uRes;       // canvas size, device px
uniform float uCell;     // dot pitch, device px
uniform float uAspect;   // video w / h
uniform vec3 uBg;
uniform float uInk;      // 1: dot size from darkness, 0: from brightness
uniform float uFeather;  // edge fade, fraction of the frame
uniform float uDevelop;  // 0 to 1 on load
uniform vec2 uRange;     // tone range that maps to no dot through a full dot

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(p / uCell);
  vec2 centre = (cell + 0.5) * uCell;

  // Contain the video, centred.
  float h = min(uRes.y, uRes.x / uAspect);
  vec2 size = vec2(h * uAspect, h);
  vec2 origin = (uRes - size) * 0.5;
  vec2 uv = (centre - origin) / size;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(uBg, 1.0); return; }

  vec3 c = texture2D(uVideo, uv).rgb;
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  float tone = smoothstep(uRange.x, uRange.y, uInk > 0.5 ? 1.0 - lum : lum);

  vec2 e = min(uv, 1.0 - uv);
  tone *= smoothstep(0.0, uFeather, e.x) * smoothstep(0.0, uFeather, e.y);

  // Develop sweeps from the bottom of the frame up, so the stem prints first.
  float sweep = clamp(uDevelop * 1.6 - (1.0 - uv.y) * 0.6, 0.0, 1.0);
  tone *= sweep * sweep * (3.0 - 2.0 * sweep);

  // Ink deepens towards the dot centre the way a real print does.
  vec3 col = uInk > 0.5 ? c * 0.86 : min(c * 1.12, 1.0);

  float rad = uCell * 0.5 * sqrt(tone) * 0.98;
  float m = 1.0 - smoothstep(rad - 0.9, rad, length(p - centre));
  gl_FragColor = vec4(mix(uBg, col, m * step(0.03, tone)), 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

// The shader reads the page colour from the theme; it must be 6-digit hex.
const pageColor = () => {
  const hex = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
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

    const u = Object.fromEntries(['uRes', 'uCell', 'uAspect', 'uBg', 'uInk', 'uFeather', 'uDevelop', 'uRange']
      .map((n) => [n, gl.getUniformLocation(prog, n)]));

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bg = pageColor();
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let hasFrame = false;
    let t0 = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const frame = (now) => {
      raf = 0;
      if (video.readyState >= 2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
        if (!hasFrame) t0 = now;
        hasFrame = true;
      }
      if (hasFrame) {
        const develop = still ? 1 : Math.min(1, (now - t0) / DEVELOP_MS);
        gl.uniform2f(u.uRes, canvas.width, canvas.height);
        gl.uniform1f(u.uCell, CELL * dpr);
        gl.uniform1f(u.uAspect, video.videoWidth / video.videoHeight || 1);
        gl.uniform3f(u.uBg, ...bg);
        gl.uniform1f(u.uInk, clip.ink);
        gl.uniform1f(u.uFeather, clip.feather);
        gl.uniform1f(u.uDevelop, develop);
        gl.uniform2f(u.uRange, ...clip.range);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if (visible && !still) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

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
    video.addEventListener('loadeddata', onReady);
    if (video.readyState >= 2) onReady();
    resize();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      video.removeEventListener('loadeddata', onReady);
    };
  }, [clip]);

  return (
    <figure className="bloom">
      <video key={clip.src} ref={videoRef} src={clip.src} muted loop playsInline preload="auto" aria-hidden="true" />
      {/* Remounted per theme so the WebGL context is rebuilt with the new clip. */}
      <canvas key={`c-${clip.src}`} ref={canvasRef} role="img" aria-label={`${clip.name}, drawn in dots`} />
      <figcaption className="label">{clip.name}</figcaption>
    </figure>
  );
}
