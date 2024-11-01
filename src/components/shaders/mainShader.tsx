import { generateShader } from "../../utils/generateShader";

export const MainShader = generateShader(
  "MainShader",
  /* glsl */ `
  attribute vec3 offset;
  attribute float rotation;
  varying vec2 vUv;
  varying float height;
  varying float depth;
  varying float dp;
  varying float rot;
  uniform float uTime;

  // Optimized Perlin Noise
  vec3 permute(vec3 x) { return mod((34.0 * x + 1.0) * x, 289.0); }
  float cnoise(vec3 P) {
    vec3 Pi = mod(floor(P), 289.0);
    vec3 Pf = fract(P);
    vec3 fade = Pf * Pf * Pf * (Pf * (Pf * 6.0 - 15.0) + 10.0);
    vec4 Pxy = permute(Pi.x + vec4(0.0, 1.0, 0.0, 1.0)) + Pi.y;
    vec4 Pz = permute(Pxy + vec4(0.0, 0.0, 1.0, 1.0));
    vec4 gx = fract(Pz * (1.0 / 7.0)) - 0.5;
    vec4 gy = abs(gx) - 0.5;
    gx -= step(0.0, gx) * (step(0.0, gy) - 0.5);
    gy -= step(0.0, gy) * (step(0.0, gx) - 0.5);
    vec3 g0 = vec3(gx.x, gy.x, 0.5 - abs(gx.x) - abs(gy.x));
    vec3 g1 = vec3(gx.y, gy.y, 0.5 - abs(gx.y) - abs(gy.y));
    vec3 g2 = vec3(gx.z, gy.z, 0.5 - abs(gx.z) - abs(gy.z));
    vec3 g3 = vec3(gx.w, gy.w, 0.5 - abs(gx.w) - abs(gy.w));
    float n0 = dot(g0, Pf);
    float n1 = dot(g1, Pf - vec3(1.0, 0.0, 0.0));
    float n2 = dot(g2, Pf - vec3(0.0, 1.0, 0.0));
    float n3 = dot(g3, Pf - vec3(1.0, 1.0, 0.0));
    vec4 fade_xyz = vec4(fade, 1.0);
    return 1.4 * mix(mix(n0, n1, fade.x), mix(n2, n3, fade.x), fade.y);
  }

  void main() {
    float sinRot = sin(rotation);
    float cosRot = cos(rotation);
    vec3 rotatedPos = vec3(
      position.x * cosRot - position.z * sinRot,
      position.y,
      position.z * cosRot + position.x * sinRot
    ) + offset;
    
    vec4 modelPosition = modelMatrix * vec4(rotatedPos, 1.0);
    float randomHeight = max(0.7, rotation / 6.28);
    modelPosition.y *= randomHeight;

    float displacement = cnoise(rotatedPos * 0.3 + uTime * 0.15) * max(0.0, modelPosition.y + 0.4) * 0.05;
    modelPosition.xz += displacement;
    dp = displacement;
    rot = modelPosition.y - 1.3;

    vec4 viewPosition = viewMatrix * modelPosition;
    vUv = uv;
    height = modelPosition.y;
    depth = projectionMatrix * viewPosition.z * 0.1 - 3.0;
    gl_Position = projectionMatrix * viewPosition;
  }`,
  /* glsl */ `
  #include <packing>

  uniform sampler2D uTexture;
  uniform float uTime;
  varying vec2 vUv;
  varying float height;
  varying float depth;
  varying float dp;
  varying float rot;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    if(texColor.a < 0.5) discard;

    vec3 gradient = mix(vec3(0.1, 0.01, 0.0), vec3(0.45, 0.6, 0.05), height);
    gradient += max(0.0, depth) / 2.0;
    gradient *= max(0.7, rot / 6.28);
    gradient.xz += max(0.0, rot) / 2.0;
    gradient.y -= max(0.0, rot) / 5.0;
    gradient *= 1.4;
    gl_FragColor = vec4(gradient, texColor.r);
  }`
);
