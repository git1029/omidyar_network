const getNodeIso = /* glsl */ `

float getNodeIso(vec2 uv, float i, float j, vec2 id, vec2 scale, vec2 aspectFactor, float af, bool flip, float roundness, float threshold, float d, float b, vec2 grid, vec2 diff, vec4 logop, vec2 xy) {
  if (uConnectors.x == 0. && xy.x == 1.) return d;
  if (uConnectors.y == 0. && xy.y == 1.) return d;

  float dir = flip ? -1. : 1.;
  float angle = angleBetween(vec2(.5, .5) * 1., vec2(1.5, 1.5) * 1.) * dir;
  float oddA = mod(id.y, 2.) * uGrid;
  float oddB = mod(id.y + dir, 2.) * uGrid;
  vec2 offA = oddA * vec2(1., 0.);
  vec2 offB = oddB * vec2(1., 0.);
  vec2 pA = (floor(uv * grid) + vec2(i, j) + offA + 0.5 + diff) / grid;
  vec2 pB = (floor(uv * grid) + vec2(i, j + dir) + offB + 0.5 + diff) / grid;
  vec2 pC = mix(pA, pB, .5);

  float sf = 1.;
  if (uLogo > 0. && (pC.x >= logop.x && pC.y < logop.w)) sf = 0.;

  vec2 uv_ = uv;
  uv_ -= .5;
  uv_ *= aspectFactor;
  uv_ += .5;
  pC -= .5;
  pC *= aspectFactor;
  pC += .5;

  vec2 pD = rotate(uv_ - pC, angle);

  if (oddA == 1. && mod(id.x, 2.) == 1.) sf = 0.;
  if (oddA == 0. && mod(id.x, 2.) == 0.) sf = 0.;
  float lowY = flip ? 1. : 0.;
  float highY = flip ? 1. : 2.;
  if (id.x < 0. || id.y < lowY || id.x > grid.x - 2. || id.y > grid.y - highY) sf = 0.;

  vec2 scl = scale;

  float a = uViewport.z;
  
  scl *= b * sf;

  return mix(d, min(d, sdRoundedBox(pD, scl, vec4(roundness) * b * sf)), step(threshold, b) * sf);
}
`;

export default getNodeIso;
