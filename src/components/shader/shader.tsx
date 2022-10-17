import { generateShader } from "../../utils/generateShader";

export const MainShader = generateShader(
  "MainShader",
  /* glsl */ `
  attribute vec3 offset;
  varying vec2 vUv;
  varying float height;
  varying float depth;
  uniform float uTime;

  void main() {
    vec3 Pos = position + offset;
    vec4 modelPosition = modelMatrix * vec4(Pos,1.0);
    modelPosition.x = sin((modelPosition.y + uTime/5.))/20.*max(0.,(modelPosition.y + 0.4)) + modelPosition.x;
    vec4 ModelPosition = viewMatrix * modelPosition;

    vec4 ViewPosition =  ModelPosition;
    vec4 ProjectedPosition = projectionMatrix * ViewPosition;
    vUv = uv;
    height = modelPosition.y;
    depth = ProjectedPosition.z * 0.01 - 0.2;
    gl_Position = ProjectedPosition;


  }`,
  /* glsl */ `
  #include <packing>

  uniform sampler2D uTexture;
  uniform float uTime;
  varying vec2 vUv;
  varying float height;
  varying float depth;

  void main() {
    vec4 texColor = texture(uTexture,vUv);
    if(texColor.a < 0.5)
    discard;
    vec3 gradient = mix(vec3(0.14,0.1,0.),vec3(0.35,0.5,0.05) + max(0.,depth)/ 2.,height - 0.2);
    // vec3 fog = gradient + max(0.,depth);
    gl_FragColor = vec4(gradient,texColor.a);
  }`
);
