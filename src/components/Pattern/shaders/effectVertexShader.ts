const effectVertexShader = /*glsl*/ `
  varying vec2 vUv;
  void main() {
    vec3 pos = position;
    // pos.xy *= float(gl_InstanceID)/3. * .1 + 1.;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vUv = uv;
  }
`;

export default effectVertexShader;
