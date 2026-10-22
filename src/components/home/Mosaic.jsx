import { useEffect, useRef, useState } from 'react';

// Footage redrawn as overlapping diamonds, one per grid cell, the technique on
// jeffreylin.dev. Each diamond is a little larger than its cell, and the cell
// further down and to the right is drawn on top, so they overlap like scales.
// Both clips were shot on black, and the black keys out to the page.
const CLIPS = {
  light: {
    src: '/motion/lily.mp4',
    caption: 'A lily opening',
    grid: 6.5, radius: 5.75, sat: 1.9, contrast: 1, gain: 1, gamma: 0.62,
    key: [0.07, 0.3], paper: 1, feather: 0.06, tint: [1.02, 1, 0.93],
  },
  dark: {
    src: '/motion/jellyfish.mp4',
    caption: 'Moon jellyfish',
    grid: 4, radius: 3.5, sat: 0.85, contrast: 1, gain: 1.1, gamma: 1,
    key: [0.02, 0.08], paper: 0, feather: 0.14, tint: [1, 1, 1],
  },
};
const FADE_MS = 700;   // out, rewind, back in: each clip plays once, then again

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
uniform float u_contrast;
uniform float u_gain;
uniform vec2 u_key;      // brightness range faded to transparent
uniform vec4 u_view;     // the cover-fitted part of the video: offset xy, size zw
uniform float u_feather;
uniform float u_gamma;
uniform vec3 u_tint;    // warms the lily's grey petals towards cream
uniform float u_paper;  // 1 on the light page, 0 on the dark one

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
  vec3 src = texture2D(u_video, u_view.xy + uv * u_view.zw).rgb;

  float alpha = 1.0;
  alpha = smoothstep(u_key.x, u_key.y, max(src.r, max(src.g, src.b)));
  vec2 edge = min(uv, 1.0 - uv);
  alpha *= smoothstep(0.0, u_feather, min(edge.x, edge.y));
  if (alpha < 0.01) discard;

  // The lily was lit low on black, so its white petals read grey on paper.
  // Lift the midtones, and let soft edges fade towards paper, not black.
  src = pow(src, vec3(u_gamma));
  src = mix(vec3(u_paper), src, smoothstep(0.0, 1.0, alpha));
  vec3 col = mix(vec3(dot(src, vec3(0.299, 0.587, 0.114))), src, u_sat);
  col = clamp(clamp((col - 0.5) * u_contrast + 0.5, 0.0, 1.0) * u_gain * u_tint, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
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
  const barRef = useRef(null);
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
      ['u_video', 'u_res', 'u_grid', 'u_radius', 'u_sat', 'u_contrast', 'u_gain', 'u_key', 'u_view', 'u_feather', 'u_gamma', 'u_paper', 'u_tint']
        .map((n) => [n, gl.getUniformLocation(program, n)]),
    );
    gl.uniform1i(u.u_video, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const c = clipRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(width * dpr));
      const h = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (video.readyState < 2 || !video.videoWidth) return;

      // Cover-fit: crop whichever side of the video overhangs the canvas.
      const va = video.videoWidth / video.videoHeight;
      const ca = w / h;
      const sx = ca > va ? 1 : ca / va;
      const sy = ca > va ? va / ca : 1;
      gl.uniform4f(u.u_view, (1 - sx) / 2, (1 - sy) / 2, sx, sy);
      gl.uniform2f(u.u_res, w, h);
      gl.uniform1f(u.u_grid, c.grid * dpr);
      gl.uniform1f(u.u_radius, c.radius * dpr);
      gl.uniform1f(u.u_sat, c.sat);
      gl.uniform1f(u.u_contrast, c.contrast);
      gl.uniform1f(u.u_gain, c.gain);
      gl.uniform2f(u.u_key, c.key[0], c.key[1]);
      gl.uniform1f(u.u_feather, c.feather);  // share of the frame that fades at each edge
      gl.uniform1f(u.u_gamma, c.gamma);
      gl.uniform1f(u.u_paper, c.paper);
      gl.uniform3f(u.u_tint, ...c.tint);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // The hairline under the picture tracks the clip.
      const p = video.duration ? video.currentTime / video.duration : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
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
    <figure className="mosaic">
      <div className="mosaic__frame">
        <video
          ref={videoRef}
          src={clip.src}
          className={noGL ? 'is-fallback' : ''}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className={shown ? 'is-shown' : ''} role="img" aria-label={clip.caption} />
      </div>
      <figcaption className="mosaic__caption">
        <span>{clip.caption}</span>
        <span className="mosaic__track" aria-hidden="true"><span ref={barRef} /></span>
      </figcaption>
    </figure>
  );
}
