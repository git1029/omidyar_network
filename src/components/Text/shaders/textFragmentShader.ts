const textFragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;
  varying vec3 vP;
  varying vec2 vOff;
  uniform float uMode;
  uniform float uLayout;
  varying vec2 vA;

  void main() {
    float d = 1.;

    if (uMode == 2.) {
      if (uLayout == 1.) {
        d = step(vA.x, vA.y == 6. ? 1.-vUv.x : vUv.x);
        d = mix(d, 0., vA.y > 6. ? 1. : 0.);
      }
      if (uLayout == 2.) {
        d = step(vA.x, vA.y == 1. || vA.y == 3. ? 1.-vUv.x : vUv.x);
        d = mix(d, 0., vA.y > 3. ? 1. : 0.);
      }
    }
    gl_FragColor = vec4(uColor, d);

    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default textFragmentShader;
