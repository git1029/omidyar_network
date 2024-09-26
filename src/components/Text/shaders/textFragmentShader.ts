const textFragmentShader = /* glsl */ `
  varying vec2 vUv;
  // varying float vT;
  uniform vec3 uColor;
  varying vec3 vP;
  varying vec2 vOff;
  uniform float uAnimating;
  uniform float uLayout;
  varying vec2 vA;

  void main() {
    // float d = step(.25, 1.-vP.x);
    float d = 1.;

    if (uAnimating == 1.) {
      if (uLayout == 1.) {
        d = step(vA.x, vA.y == 6. ? 1.-vUv.x : vUv.x);
        d = mix(d, 0., vA.y > 6. ? 1. : 0.);
      }
      if (uLayout == 2.) {
        d = step(vA.x, vA.y == 1. ? 1.-vUv.x : vUv.x);
        d = mix(d, 0., vA.y > 1. ? 1. : 0.);
        // d = 1.;
      }
    }
    gl_FragColor = vec4(uColor, d);
    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default textFragmentShader;
