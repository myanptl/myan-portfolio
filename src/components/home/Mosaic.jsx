import { useEffect, useRef, useState } from 'react';

// Footage redrawn as overlapping diamonds, the jeffreylin.dev technique with
// his numbers. Each diamond is larger than its cell and the cell further down
// and to the right is drawn on top, so they overlap like scales. The whole
// frame is drawn, background included. Each clip plays once, fades out,
// rewinds and comes back.
const CLIPS = {
  light: { src: '/motion/peony.mp4', label: 'A white peony opening', grid: 6.5, radius: 5.75 },
  dark: { src: '/motion/jellyfish.mp4', label: 'Moon jellyfish drifting', grid: 4, radius: 3.5 },
};
const SATURATION = 1.3;
const CROP = [0, 0, 0, 0]; // top, right, bottom, left
const FADE_MS = 700;

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x, -a_pos.y) * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_video;
uniform vec2 u_res;
uniform float u_grid;
uniform float u_radius;
uniform float u_sat;
uniform vec4 u_crop;

void main() {
  vec2 px = v_uv * u_res;
  vec2 own = floor(px / u_grid);
  float best = -1.0;
  vec2 cell = own;
  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      vec2 c = own + vec2(float(dx), float(dy));
      vec2 d = abs(px - (c + 0.5) * u_grid);
      float order = c.y * 8192.0 + c.x;
      if (d.x + d.y <= u_radius && order > best) { best = order; cell = c; }
    }
  }
  if (best < 0.0) discard;

  vec2 uv = (cell + 0.5) * u_grid / u_res;
  vec2 lo = vec2(u_crop.w, u_crop.x);
  vec2 hi = vec2(1.0 - u_crop.y, 1.0 - u_crop.z);
  vec3 col = texture2D(u_video, lo + uv * (hi - lo)).rgb;
  col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, u_sat);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const resolvedTheme = () => document.documentElement.dataset.theme
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function compile(gl, type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

export function Mosaic() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [theme, setTheme] = useState(resolvedTheme);
  const [shown, setShown] = useState(false);
  const [noGL, setNoGL] = useState(false);
  const clip = CLIPS[theme];
  const clipRef = useRef(clip);
  clipRef.current = clip;

  // Follow the toggle and the system setting.
  useEffect(() => {
    const sync = () => setTheme(resolvedTheme());
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', sync);
    return () => { mo.disconnect(); mq.removeEventListener('change', sync); };
  }, []);

  // Playback: once through, fade out, rewind, fade back in.
  useEffect(() => {
    const video = videoRef.current;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = 0;
    setShown(false);

    const onLoaded = () => {
      if (still) {
        // No motion: hold the last frame, the flower fully open.
        video.currentTime = Math.max(0, video.duration - 0.1);
        video.addEventListener('seeked', () => setShown(true), { once: true });
        return;
      }
      video.play().catch(() => {});
      requestAnimationFrame(() => setShown(true));
    };
    const onEnded = () => {
      setShown(false);
      timer = setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        setShown(true);
      }, FADE_MS);
    };

    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('ended', onEnded);
    video.load();
    return () => {
      clearTimeout(timer);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('ended', onEnded);
    };
  }, [clip.src]);

  // Drawing.
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: false });
    if (!gl) { setNoGL(true); return undefined; }

    const program = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const u = Object.fromEntries(
      ['u_video', 'u_res', 'u_grid', 'u_radius', 'u_sat', 'u_crop'].map((n) => [n, gl.getUniformLocation(program, n)]),
    );
    gl.uniform1i(u.u_video, 0);
    gl.uniform1f(u.u_sat, SATURATION);
    gl.uniform4f(u.u_crop, ...CROP);

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const c = clipRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(width * dpr));
      const h = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (video.readyState < 2) return;
      gl.uniform2f(u.u_res, w, h);
      gl.uniform1f(u.u_grid, c.grid * dpr);
      gl.uniform1f(u.u_radius, c.radius * dpr);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <div className="mosaic">
      <video
        ref={videoRef}
        src={clip.src}
        className={noGL ? 'is-fallback' : ''}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className={shown ? 'is-shown' : ''} role="img" aria-label={clip.label} />
    </div>
  );
}
