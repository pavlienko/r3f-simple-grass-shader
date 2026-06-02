import { generateShader } from "../../utils/generateShader";

export const GroundShader = generateShader(
    "GroundShader",
  /* glsl */ `
  varying vec2 vUv;
  varying float vViewZDepth;

  void main() {
    vec3 Pos = position;
    vec4 modelPosition = modelMatrix * vec4(Pos,1.0);
    vec4 ModelPosition = viewMatrix * modelPosition;
    vec4 ViewPosition =  ModelPosition;
    vec4 ProjectedPosition = projectionMatrix * ViewPosition;
    gl_Position = ProjectedPosition;
    vUv = uv;

    vViewZDepth = -ViewPosition.z;
  }`,
  /* glsl */ `
  #include <packing>

  varying vec2 vUv;
  varying float vViewZDepth;

  void main() {
    vec3 ground = vec3(0.2,0.1,0.);

    float density = 0.012; 

    float fogFactor = 1.0 - exp(-pow(vViewZDepth * density, 2.0));
    fogFactor = clamp(fogFactor, 0.0, 1.0);
    vec3 fogColor = vec3(0.88, 0.89, 0.91);

    vec3 finalColor = mix(ground, fogColor, fogFactor);

    gl_FragColor = vec4(finalColor,1.0);
  }`,
);
