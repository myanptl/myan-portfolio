// 09 grain, 10 pointer displacement on a real work capture.

import { createSpring, onFrame, controls, note, stage } from './core.js';

const style = document.createElement('style');
style.textContent = `
.gr { position: relative; min-height: 260px; display: grid; place-items: center; padding: 2.5rem;
  background: linear-gradient(140deg, hsl(250 42% 20%), hsl(222 44% 13%)); overflow: hidden; }
.gr__h { font-size: clamp(1.5rem, 1rem + 2.2vw, 2.8rem); font-weight: 500; letter-spacing: -0.03em;
  text-align: center; max-width: 20ch; position: relative; z-index: 2; }
.gr__layer { position: absolute; inset: -120px; pointer-events: none; z-index: 3;
  background-repeat: repeat; will-change: transform; }
.dp { position: relative; min-height: 300px; display: grid; place-items: center; padding: 1.5rem; }
.dp__canvas { max-width: 100%; border: 1px solid var(--rule); border-radius: 2px; display: block; }
.dp__fallback { font-family: 'Plex Mono', monospace; font-size: 0.7rem; color: var(--fg-45);
  text-align: center; line-height: 1.7; }
`;
document.head.appendChild(style);

/** Film grain as a tiled noise bitmap. Cheaper than any filter. */
function noiseDataURL(size = 128, alpha = 26) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = alpha;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

export function grainDemo() {
  const host = stage('grain');
  const wrap = document.createElement('div');
  wrap.className = 'gr';
  const h = document.createElement('p');
  h.className = 'gr__h';
  h.textContent = 'Grain gives a flat gradient something to sit on.';
  const layer = document.createElement('div');
  layer.className = 'gr__layer';
  wrap.append(h, layer);
  host.appendChild(wrap);

  let url = noiseDataURL(128, 26);
  layer.style.backgroundImage = `url(${url})`;
  layer.style.mixBlendMode = 'overlay';
  let jitter = 8;
  let frame = 0;

  controls(host, [
    {
      key: 'a',
      label: 'grain alpha',
      min: 0,
      max: 70,
      value: 26,
      onInput: (n) => {
        url = noiseDataURL(128, n);
        layer.style.backgroundImage = `url(${url})`;
      },
    },
    { key: 'j', label: 'jitter fps', min: 0, max: 30, value: 8, onInput: (n) => (jitter = n) },
    {
      key: 'b',
      label: 'blend',
      min: 0,
      max: 3,
      value: 1,
      format: (n) => ['normal', 'overlay', 'soft-light', 'color-dodge'][n],
      onInput: (n) => {
        layer.style.mixBlendMode = ['normal', 'overlay', 'soft-light', 'color-dodge'][n];
      },
    },
  ]);

  note(
    'grain',
    `A 128px noise tile generated once into a data URL, repeated, and nudged a few pixels on an interval.
     No <code>filter</code>, no per frame canvas work, no shader. Active Theory runs grain over their
     whole page and blends with <code>color-dodge</code> and <code>plus-lighter</code>.
     <br><br>Why bother: your grounds are large flat fills, and flat fills are the thing that most
     reliably reads as a template. Grain is the cheapest way to make a surface look like a material.
     <br><br><strong>Marked amber, not green.</strong> This is exactly the kind of blanket overlay that
     can tip into the dither territory you already rejected. If it goes anywhere it belongs on the ink
     and violet grounds only, at very low alpha, and nowhere near the work captures. Judge it at alpha
     15 to 25, not at the default.`
  );

  let acc = 0;
  onFrame((dt) => {
    if (!jitter) return;
    acc += dt;
    if (acc < 1 / jitter) return;
    acc = 0;
    frame++;
    const x = (Math.random() * 60 - 30) | 0;
    const y = (Math.random() * 60 - 30) | 0;
    layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform vec2 uAspect;
uniform float uRadius;
uniform float uStrength;
uniform float uRgb;

void main() {
  vec2 d = (vUv - uMouse) * uAspect;
  float dist = length(d);

  // smoothstep is undefined when edge0 > edge1, so invert rather than reverse.
  float infl = 1.0 - smoothstep(0.0, uRadius, dist);

  vec2 dir = dist > 0.0001 ? normalize(d) / uAspect : vec2(0.0);
  vec2 push = dir * infl * uStrength;

  vec2 uvR = vUv + push * (1.0 + uRgb);
  vec2 uvG = vUv + push;
  vec2 uvB = vUv + push * (1.0 - uRgb);

  float r = texture2D(uTex, uvR).r;
  float g = texture2D(uTex, uvG).g;
  float b = texture2D(uTex, uvB).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('[lab] shader failed', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export function displaceDemo() {
  const host = stage('displace');
  const wrap = document.createElement('div');
  wrap.className = 'dp';
  host.appendChild(wrap);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onerror = () => {
    const p = document.createElement('p');
    p.className = 'dp__fallback';
    p.textContent = 'CAPTURE NOT FOUND. RUN npm run dev SO /work IS SERVED.';
    wrap.appendChild(p);
    note('displace', 'Could not load the capture, so this demo did not initialise.');
  };

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.className = 'dp__canvas';
    const w = Math.min(760, img.naturalWidth);
    const h = Math.round((w / img.naturalWidth) * img.naturalHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    wrap.appendChild(canvas);

    // Opaque image, so no premultiplied alpha trap here. Alpha is always 1.
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) {
      wrap.textContent = 'WebGL unavailable.';
      return;
    }

    const prog = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

    const uMouse = gl.getUniformLocation(prog, 'uMouse');
    const uAspect = gl.getUniformLocation(prog, 'uAspect');
    const uRadius = gl.getUniformLocation(prog, 'uRadius');
    const uStrength = gl.getUniformLocation(prog, 'uStrength');
    const uRgb = gl.getUniformLocation(prog, 'uRgb');

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uAspect, w / h, 1);
    gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0);

    let radius = 0.28;
    let strength = 0.05;
    let rgb = 0.35;

    const mx = createSpring({ stiffness: 180, damping: 20, value: 0.5 });
    const my = createSpring({ stiffness: 180, damping: 20, value: 0.5 });
    const amp = createSpring({ stiffness: 140, damping: 18, value: 0 });

    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mx.target = (e.clientX - r.left) / r.width;
      my.target = (e.clientY - r.top) / r.height;
      amp.target = 1;
    });
    canvas.addEventListener('pointerleave', () => {
      amp.target = 0;
    });

    controls(host, [
      { key: 'r', label: 'radius', min: 0.05, max: 0.7, step: 0.01, value: 0.28, onInput: (n) => (radius = n) },
      { key: 's', label: 'strength', min: 0, max: 0.18, step: 0.005, value: 0.05, onInput: (n) => (strength = n), format: (n) => n.toFixed(3) },
      { key: 'c', label: 'rgb split', min: 0, max: 1.5, step: 0.05, value: 0.35, onInput: (n) => (rgb = n) },
    ]);

    onFrame((dt) => {
      mx.step(dt);
      my.step(dt);
      amp.step(dt);
      gl.uniform2f(uMouse, mx.value, my.value);
      gl.uniform1f(uRadius, radius);
      gl.uniform1f(uStrength, strength * amp.value);
      gl.uniform1f(uRgb, rgb);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    });

    note(
      'displace',
      `A single full screen triangle, the capture as a texture, and UVs pushed radially away from the
       pointer. The RGB split samples the three channels at slightly different offsets, which is where
       the electronic quality comes from.
       <br><br><strong>Read this before you like it.</strong> You rejected a dither overlay on the work
       images because covering or degrading a screenshot makes the product unreadable, and your own
       project notes say captures are shown complete and unfiltered or not at all. This demo bends the
       capture. At <code>strength 0.05</code> it is a lens, at <code>0.12</code> it is damage.
       <br><br>My honest read is that this one fails your own rule and I would not ship it on the work
       index. It is here because you asked to see every mechanic working, and because the same shader
       aimed at a background rather than a screenshot would be fine. Push strength to zero and it is
       just a textured quad, which tells you how little of it you actually want.`
    );
  };

  img.src = '/work/focusos-800.webp';
}
