// A liquid-metal field rendered with raw WebGL and dithered to one bit.
//
// No three.js. The whole thing is one fullscreen fragment shader, which keeps
// it at a few kb instead of ~150kb of library. It renders into a deliberately
// tiny buffer (a few hundred pixels wide) and is scaled up by CSS with
// image-rendering: pixelated, so the dither cells stay chunky and the shader
// costs almost nothing to run.

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

// Recursive Bayer construction. bayer2 tiles a 2x2 ordered matrix; each nested
// call adds a finer level, giving an 8x8 threshold map without a lookup table.
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
#define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
#define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))

// Smooth minimum. Merges the distance fields so the forms flow into one
// another instead of intersecting as hard circles.
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Signed distance to the union of the blobs. Negative inside.
//
// A summed inverse-square field was tried first and abandoned: its dynamic
// range is so wide that the surface saturated past the dither threshold
// everywhere at once and rendered as one solid white shape.
// Centred to the right of the headline. K is generous so the parts read as one
// flowing mass rather than a scatter of separate lumps.
const vec2 HOME = vec2(0.33, -0.07);
const float K = 0.22;

float sdf(vec2 uv, vec2 m, float t) {
  float d = length(uv - HOME - vec2(cos(t * 0.62) * 0.12, sin(t * 0.48) * 0.09)) - 0.165;
  d = smin(d, length(uv - HOME - vec2(cos(t * 0.41 + 2.0) * 0.16, sin(t * 0.73 + 1.0) * 0.12)) - 0.130, K);
  d = smin(d, length(uv - HOME - vec2(cos(t * 0.86 + 4.1) * 0.10, sin(t * 0.55 + 3.0) * 0.14)) - 0.110, K);
  d = smin(d, length(uv - HOME - vec2(cos(t * 0.33 + 1.4) * 0.18, sin(t * 0.64 + 5.2) * 0.07)) - 0.095, K);
  // The pointer is another blob in the same field, so it melts into the others
  // instead of floating over them. Moving the mouse pulls the metal toward it.
  d = smin(d, length(uv - m) - 0.100, 0.26);
  return d;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m  = (u_mouse * u_res - 0.5 * u_res) / u_res.y;
  float t = u_time * 0.55;

  float d = sdf(uv, m, t);

  // Gradient of the distance field, which is the in-plane part of the normal.
  float e = 1.6 / u_res.y;
  float gx = sdf(uv + vec2(e, 0.0), m, t) - sdf(uv - vec2(e, 0.0), m, t);
  float gy = sdf(uv + vec2(0.0, e), m, t) - sdf(uv - vec2(0.0, e), m, t);
  vec2 g = vec2(gx, gy) / (2.0 * e);

  // Dome height from depth inside the surface: flat on top, steep at the rim.
  float dome = sqrt(max(0.0, -d * 2.6));
  vec3 n = normalize(vec3(g * 0.55, dome + 0.22));

  // Fake chrome. The banded term is what reads as polished metal; without it
  // the form is just a matte lump.
  vec3 L = normalize(vec3(0.5, 0.72, 0.55));
  float spec = pow(max(dot(n, L), 0.0), 26.0);
  float bands = 0.5 + 0.5 * sin(n.x * 9.5 + n.y * 5.5 + t * 0.5);
  float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 3.0);

  float shade = bands * 0.52 + spec * 0.62 + fres * 0.34;

  // Confine to the body of the form, with a soft rim.
  // Written as 1.0 - smoothstep(lo, hi, d) rather than the reversed-edge
  // idiom smoothstep(hi, lo, d): GLSL leaves edge0 > edge1 undefined, and on
  // this path it returned 1.0 everywhere, so the whole canvas filled solid.
  float inside = 1.0 - smoothstep(-0.030, 0.012, d);
  shade *= inside;
  shade *= u_intensity;

  // One-bit output. The threshold map is sampled in device pixels, which are
  // the chunky upscaled cells.
  float th = bayer8(gl_FragCoord.xy);
  // The second term is a floor. Without it, cells whose Bayer threshold is 0
  // satisfy step(0.0, 0.0) even in fully empty space, which scatters a regular
  // grid of stray dots across the whole canvas.
  float lit = step(th, clamp(shade, 0.0, 1.0)) * step(0.004, shade);

  // Premultiplied, because the context is created with premultipliedAlpha.
  // Emitting vec4(1.0, 1.0, 1.0, lit) here has colour exceeding alpha, which
  // browsers composite as opaque white: the canvas fills solid and every bit
  // of visible shape ends up coming from the CSS mask instead of the shader.
  gl_FragColor = vec4(vec3(lit), lit);
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

/**
 * Sets up the renderer on a canvas. Returns a handle with render/resize/dispose,
 * or null when WebGL is unavailable so the caller can fall back.
 */
export function createLiquidMetal(canvas) {
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

  // One triangle large enough to cover the clip volume. Cheaper than a quad
  // and avoids the seam a two-triangle quad can show.
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
    render(timeSeconds, mouseX, mouseY, intensity) {
      gl.uniform1f(uTime, timeSeconds);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uIntensity, intensity);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // Deliberately does NOT call WEBGL_lose_context.loseContext(). A canvas
      // keeps one context for its lifetime, so force-losing it here leaves the
      // element permanently dead: StrictMode double-invokes effects in dev
      // (mount, cleanup, mount) and the second mount would get the lost
      // context back from getContext and silently fail to draw.
    },
  };
}
