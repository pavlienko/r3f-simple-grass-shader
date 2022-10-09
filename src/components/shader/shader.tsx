import { generateShader } from "../../utils/generateShader";

export const MainShader = generateShader(
  "MainShader",
  /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;

  void main() {

    vec4 modelPosition = modelMatrix * vec4(position,1.0);
    modelPosition.x = sin((modelPosition.y + uTime/5.))/20.*max(0.,(modelPosition.y + 0.4)) + modelPosition.x;
    vec4 ModelPosition = viewMatrix * modelPosition;
    vec4 ViewPosition =  ModelPosition;
    vec4 ProjectedPosition = projectionMatrix * ViewPosition;
    gl_Position = ProjectedPosition;
    vUv = uv;
  }`,
  /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    // vec3 texture = texture2D(uTexture, vUv).rgb;
    // gl_FragColor = vec4(texture, texture.r + texture.g + texture.b);
    // gl_FragColor.xyz *= gl_FragColor.w;
    vec4 texColor = texture(uTexture,vUv);
    if(texColor.a < 0.1)
    discard;
    // gl_FragColor = vec4(1.,1.,0.,0.5);
    gl_FragColor = texColor;
  }`
);
