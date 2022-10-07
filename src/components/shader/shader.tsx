import { generateShader } from "../../utils/generateShader";

export const MainShader = generateShader(
  "MainShader",
  /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;

  void main() {

    vec4 ModelPosition = modelViewMatrix * vec4(position, 1.0);
    ModelPosition.x = position.x;
    vec4 ViewPosition = viewMatrix * ModelPosition;
    vec4 ProjectedPosition = projectionMatrix * ViewPosition;
    gl_Position = ProjectedPosition;
    vUv = uv;
  }`,
  /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(0.,vUv.y, 1.0, 1.0);
  }`
);
