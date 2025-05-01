import { generateShader } from "../../utils/generateShader";

export const MainShader = generateShader(
  "MainShader",
  /* vertex */ `
  attribute vec3 offset;
  attribute float rotation;
  varying vec2 vUv;
  varying float height;
  varying float depth;
  uniform float uTime;

  // cheap 2D value-noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
  }

  void main() {
    // rotate & offset the blade
    float s = sin(rotation), c = cos(rotation);
    vec3 pos = vec3(
      position.x * c - position.z * s,
      position.y,
      position.z * c + position.x * s
    ) + offset;

    // scale height variation
    pos.y *= max(0.7, rotation / (2.0 * 3.1415));

    // 2D noise-based sway
    float n = noise(pos.xz * 0.3 + uTime);
    pos.xz += n * max(pos.y + 0.4, 0.0) * 0.05;

    vUv = uv;
    height = pos.y;
    // simple depth metric
    vec4 vp = viewMatrix * modelMatrix * vec4(pos, 1.0);
    depth = projectionMatrix * vp.z * 0.1 - 3.0;
    gl_Position = projectionMatrix * vp;
  }`,
  /* fragment */ `
  uniform sampler2D uTexture;
  varying vec2 vUv;
  varying float height;
  varying float depth;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    if (tex.a < 0.5) discard; // still OK for grass alpha-cutout

    // blend base color by height and depth
    vec3 col = mix(vec3(0.1, 0.01, 0.0), vec3(0.45, 0.6, 0.05), height);
    col += max(depth, 0.0) * 0.5;
    gl_FragColor = vec4(col, tex.r);
  }`
);
