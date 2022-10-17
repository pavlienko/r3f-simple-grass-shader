import { generateShader } from "../../utils/generateShader";

export const GroundShader = generateShader(
  "GroundShader",
  /* glsl */ `
  varying vec2 vUv;
  varying float depth;

  void main() {
    vec3 Pos = position;
    vec4 modelPosition = modelMatrix * vec4(Pos,1.0);
    vec4 ModelPosition = viewMatrix * modelPosition;
    vec4 ViewPosition =  ModelPosition;
    vec4 ProjectedPosition = projectionMatrix * ViewPosition;
    gl_Position = ProjectedPosition;
    vUv = uv;
    depth = ProjectedPosition.z * 0.1 - 3.;
  }`,
  /* glsl */ `
  #include <packing>

  varying vec2 vUv;
  varying float depth;

  void main() {
    vec3 ground = vec3(0.082,0.027,0.);
    ground += max(0.,depth)/2.;
    gl_FragColor = vec4(ground,1.0);
  }`
);
