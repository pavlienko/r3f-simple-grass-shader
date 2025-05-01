import { generateShader } from "../../utils/generateShader";

export const GroundShader = generateShader(
  "GroundShader",
  /* vertex */ `
  varying vec2 vUv;
  varying float depth;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec4 viewPos = viewMatrix * worldPos;
    vec4 projPos = projectionMatrix * viewPos;
    depth = projPos.z * 0.1 - 3.0;
    gl_Position = projPos;
  }`,
  /* fragment */ `
  varying vec2 vUv;
  varying float depth;
  void main() {
    vec3 base = vec3(0.2, 0.1, 0.0);
    // simple depth-based lightening
    base += max(depth, 0.0) * 0.5;
    gl_FragColor = vec4(base, 1.0);
  }`
);
