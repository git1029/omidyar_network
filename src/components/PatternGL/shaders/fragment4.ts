// SDF circle formula from https://iquilezles.org/articles/distfunctions2d/

const fragmentShader = /* glsl */ `
 
void main() {
  gl_FragColor = vec4(1., 0., 0., 1.);
  #include <colorspace_fragment>
}


  // #include <tonemapping_fragment>
  

  // void main() {
  //   float grid = 10.;

  //   float r = 1.;
  //   // float d = 1000000.;

  //   // for (float i = 0.; i < grid * grid; i++) {
  //   //   float x = mod(i, grid) / grid;
  //   //   float y = floor(i / grid) / grid;
  //   //   vec2 p = vec2(x, y);
  //   //   d = min(d, sdCircle(vUv - p - .5/grid, r / 4.));
  //   // }

  //   // d = smoothstep(r/4. - .001, r/4., d);

  //   vec2 uv = mod(vUv * grid, 1.);

  //   float d = sdCircle(uv - .5, r / 4.);
  //   d = smoothstep(r/4. - .01, r/4., d);

  //   gl_FragColor = vec4(vec3(d), 1.);
  // }
`;

export default fragmentShader;
