const getNodeSquare = /* glsl */ `

  // Sqaure grid lines
  float getNodeSquare(vec2 uv, vec2 off, vec2 aspectFactor, bool vert, vec2 scale, float roundness, float threshold, float d, float b, vec2 grid, vec4 logop) {
    // // Sqaure grid lines
    // vec2 sbox = vec2(.5/grid, .125/grid * .5);
    // vec4 roundness = vec4(0.1/grid);

    // // Horizontal
    // vec2 px = (floor(uv * grid) + vec2(i, j) + vec2(.5, 0.)) / grid;
    // float sfx = 1.;
    // if (px.x < 0. || px.y < 0. || px.x > 1. || px.y > 1.) sfx = 0.;
    // vec4 bx = getBrightness(px);
    // // color = mix(bx.rgb, b0.rgb, mod(floor(uTime), 2.));
    // vec2 uvx = uv;
    // uvx -= .5;
    // uvx *= af;
    // uvx += .5;
    // px -= .5;
    // px *= af;
    // px += .5;
    // vec2 rx = sbox * b0f * sfx;
    // d1 = min(d1, sdRoundedBox(uvx - px, rx, roundness));

    // // Vertical
    // vec2 py = (floor(uv * grid) + vec2(i, j) + vec2(.0, .5)) / grid;
    // float sfy = 1.;
    // if (py.x < 0. || py.y < 0. || py.x > 1. || py.y > 1.) sfy = 0.;
    // vec4 by = getBrightness(py);
    // // color = mix(by.rgb, b0.rgb, mod(floor(uTime), 2.));
    // vec2 uvy = uv;
    // uvy -= .5;
    // uvy *= af;
    // uvy += .5;
    // py -= .5;
    // py *= af;
    // py += .5;
    // vec2 ry = vec2(sbox.y, sbox.x) * b0f * sfy;
    // d1 = min(d1, sdRoundedBox(uvy - py, ry, roundness));

    float a = uViewport.z;
    vec2 scl = scale;
    // if (vert && a < 1.) scl.x /= a;
    // if (!vert && a >= 1.) scl.x *= a;
    if (vert) scl = scl.yx;

    // vec2 p = (floor(uv * uQuantity) + off) / uQuantity;
    vec2 p = (floor(uv * grid) + off) / grid;
    float sf = 1.;
    if (uLogo > 0. && (p.x + scl.x/2. >= logop.x && (p.y - scl.y/2.) < logop.w)) sf = 0.;
    if (p.x < 0. || p.y < 0. || p.x > 1. || p.y > 1.) sf = 0.;
    // vec4 b = getBrightness(p);
    // color = mix(bx.rgb, b0.rgb, mod(floor(uTime), 2.));
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
