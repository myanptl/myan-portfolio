// Iridescent liquid chrome, rendered with raw WebGL.
//
// One fullscreen fragment shader, no three.js. A signed-distance blob is given
// a normal, then shaded as polished metal with thin-film interference colour,
// which is where the violet/amber/teal shift comes from. Rendered at half
// resolution and scaled up smoothly, so it stays cheap without looking blocky.

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_intensity;

// Cosine palette. Cheap way to get a full spectral sweep from one scalar.
vec3 palette(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.00, 0.33, 0.67)));
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

const vec2 HOME = vec2(0.02, -0.02);
const float K = 0.24;

float sdf(vec2 uv, vec2 m, float t) {
  float d = length(uv - HOME - vec2(cos(t * 0.62) * 0.34, sin(t * 0.48) * 0.14)) - 0.300;
  d = smin(d, length(uv - HOME - vec2(cos(t * 0.41 + 2.0) * 0.44, sin(t * 0.73 + 1.0) * 0.17)) - 0.250, K);
  d = smin(d, length(uv - HOME - vec2(cos(t * 0.86 + 4.1) * 0.30, sin(t * 0.55 + 3.0) * 0.19)) - 0.215, K);
  d = smin(d, length(uv - HOME - vec2(cos(t * 0.33 + 1.4) * 0.50, sin(t * 0.64 + 5.2) * 0.11)) - 0.190, K);
  // The pointer is a blob in the same field, so the metal reaches for it.
  d = smin(d, length(uv - m) - 0.105, 0.28);
  return d;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m  = (u_mouse * u_res - 0.5 * u_res) / u_res.y;
  float t = u_time * 0.5;

  float d = sdf(uv, m, t);

  float e = 1.2 / u_res.y;
  float gx = sdf(uv + vec2(e, 0.0), m, t) - sdf(uv - vec2(e, 0.0), m, t);
  float gy = sdf(uv + vec2(0.0, e), m, t) - sdf(uv - vec2(0.0, e), m, t);
  vec2 g = vec2(gx, gy) / (2.0 * e);

  // Dome height from depth inside the surface: flat on top, steep at the rim.
  float dome = sqrt(max(0.0, -d * 2.4));
  vec3 n = normalize(vec3(g * 0.62, dome + 0.20));

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 R = reflect(-V, n);

  // Fresnel: grazing angles at the rim reflect hardest, which is what makes
  // the edge read as metal rather than plastic.
  float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.6);

  // Banded environment. The bands are the reflected "room" the chrome sits in.
  float bands = 0.5 + 0.5 * sin(R.y * 7.0 + R.x * 4.0 + t * 0.7);

  // Thin-film interference. The range is deliberately narrow: sweeping the
  // full palette reads as a rainbow gradient rather than a metal, and that
  // look has been rejected here before. This stays in a violet through
  // magenta to amber band and is cut with silver so it reads as chrome.
  vec3 iri = palette(fres * 0.26 + R.x * 0.09 + t * 0.026 + 0.18);
  vec3 silver = vec3(0.74, 0.75, 0.80);
  iri = mix(silver, iri, 0.62);

  vec3 L = normalize(vec3(0.45, 0.75, 0.55));
  float spec = pow(max(dot(n, L), 0.0), 42.0);

  vec3 col = iri * (0.34 + 0.66 * bands);
  col += vec3(1.0) * spec * 1.25;
  col += iri * fres * 0.55;

  // Slight lift toward white in the core so it reads as polished, not matte.
  col = mix(col, vec3(1.0), spec * 0.45);

  float inside = 1.0 - smoothstep(-0.028, 0.008, d);
  float alpha = inside * u_intensity;

  // Premultiplied: the context is created with premultipliedAlpha, so colour
  // must never exceed alpha or it composites as opaque white.
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader compile failed: ${log}`);
  }
  return shader;
}

export function createChrome(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'link failed');
    }
  } catch {
    return null;
  }

  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, 'u_res');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');
  const uIntensity = gl.getUniformLocation(program, 'u_intensity');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return {
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uRes, width, height);
    },
    render(seconds, mouseX, mouseY, intensity) {
      gl.uniform1f(uTime, seconds);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uIntensity, intensity);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    // Never calls loseContext: a canvas keeps one context for life, and
    // StrictMode's second mount would get a dead one back.
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
