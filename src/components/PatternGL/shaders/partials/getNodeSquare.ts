const getNodeSquare = /* glsl */ `
  // Sqaure grid lines
  float getNodeSquare(vec2 uv, vec2 off, vec2 aspectFactor, bool vert, vec2 scale, float roundness, float threshold, float d, float b, vec2 grid, vec4 logop) {
    float a = uViewport.z;
    vec2 scl = scale;
    if (vert) scl = scl.yx;

    vec2 p = (floor(uv * grid) + off) / grid;
    float sf = 1.;
    if (uLogo > 0. && (p.x + scl.x/2. >= logop.x && (p.y - scl.y/2.) < logop.w)) sf = 0.;
    if (p.x < 0. || p.y < 0. || p.x > 1. || p.y > 1.) sf = 0.;
    
    vec2 uv_ = uv;
    uv_ -= .5;
    uv_ *= aspectFactor;
    uv_ += .5;
    p -= .5;
    p *= aspectFactor;
    p += .5;
    vec2 r = scl * b * sf;
    return mix(d, min(d, sdRoundedBox(uv_ - p, r, vec4(roundness) * b * sf)), step(threshold, b) * sf);
  }
`;

export default getNodeSquare;
