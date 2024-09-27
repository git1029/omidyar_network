const effectFragmentShader = /*glsl*/ `
  uniform sampler2D uTex;
  uniform vec3 uColor;
  // uniform float uAlpha;
  uniform vec2 uEffect;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec4 color = vec4(0.);
    float uCount = mix(1., 10., uEffect.x);
    for (float i = 0.; i < uCount; i++) {
      vec2 uv = vUv;
      uv -= .5;
      uv *= 1. + i/uCount * .6 * (sin(uTime)*.5+.5);
      uv += .5;

      vec4 c = texture(uTex, uv);
      vec4 cc = vec4(uColor, c.a - i/uCount * .5);

      color = max(color, cc);
    }
    gl_FragColor = color;
    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default effectFragmentShader;
