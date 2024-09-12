// SDF circle formula from https://iquilezles.org/articles/distfunctions2d/

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float PI;
  uniform float uMode; // 0 = image, 1 = video, 2 = camera, 3 = text
  uniform float uGrid; // 0 = square, 1 = isometric
  uniform float uQuantity; // 0 = square, 1 = isometric
  uniform vec3 uForegroundColor;
  uniform vec3 uBackgroundColor;
  uniform sampler2D uImage;
  uniform sampler2D uVideo;
  uniform sampler2D uCamera;
  uniform sampler2D uText;
  uniform float uDotSize;
  uniform float uAlpha;
  uniform vec2 uDensity;
  uniform vec2 uConnectors;
  uniform float uContrast;
  uniform float uInvert;
  uniform vec2 uViewport;
  uniform float uDPR;


  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  float opUnion(float d1, float d2) {
    return min(d1, d2);
  }
  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  float smin( float a, float b, float k ) {
    k *= 2.0;
    float x = b-a;
    return 0.5*( a+b-sqrt(x*x+k*k) );
  }

  float smoothUnionSDF(float distA, float distB, float k ) {
    float h = clamp(0.5 + 0.5*(distA-distB)/k, 0., 1.);
    return mix(distA, distB, h) - k*h*(1.-h); 
  }

  float sdBox( in vec2 p, in vec2 b ) {
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
  }

  float sdEllipse( in vec2 p, in vec2 ab )
{
    p = abs(p); if( p.x > p.y ) {p=p.yx;ab=ab.yx;}
    float l = ab.y*ab.y - ab.x*ab.x;
    float m = ab.x*p.x/l;      float m2 = m*m; 
    float n = ab.y*p.y/l;      float n2 = n*n; 
    float c = (m2+n2-1.0)/3.0; float c3 = c*c*c;
    float q = c3 + m2*n2*2.0;
    float d = c3 + m2*n2;
    float g = m + m*n2;
    float co;
    if( d<0.0 )
    {
        float h = acos(q/c3)/3.0;
        float s = cos(h);
        float t = sin(h)*sqrt(3.0);
        float rx = sqrt( -c*(s + t + 2.0) + m2 );
        float ry = sqrt( -c*(s - t + 2.0) + m2 );
        co = (ry+sign(l)*rx+abs(g)/(rx*ry)- m)/2.0;
    }
    else
    {
        float h = 2.0*m*n*sqrt( d );
        float s = sign(q+h)*pow(abs(q+h), 1.0/3.0);
        float u = sign(q-h)*pow(abs(q-h), 1.0/3.0);
        float rx = -s - u - c*4.0 + 2.0*m2;
        float ry = (s - u)*sqrt(3.0);
        float rm = sqrt( rx*rx + ry*ry );
        co = (ry/sqrt(rm-rx)+2.0*g/rm-m)/2.0;
    }
    vec2 r = ab * vec2(co, sqrt(1.0-co*co));
    return length(r-p) * sign(p.y-r.y);
}

  float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r )
{
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

float angleBetween(vec2 p, vec2 q) {
  return acos(dot(normalize(q - p), vec2(1., 0.)));
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, s, -s, c);
	return m * v;
}


  //  // Brightness (addition)
  //  float brightnessAmount = .1;
  //  // color += brightnessAmount;

  //  // Saturation
  //  float lumninanceLinear = dot(color, vec3(1./3.)); // (c.r + c.g + c.b) / 3.
  //  // NB: weighing color rgb components equally does not align with human eye color perception and relative luminance, where green is perceived brighter than red and red more than blue 
  //  float lumninancePerceptual = dot(color, vec3(0.2126, 0.7152, 0.0722));
  //  float luminance = mix(lumninanceLinear, lumninancePerceptual, t);
  //  luminance = lumninancePerceptual;
  //  float saturationAmount = 0.;
  //  // color = mix(vec3(luminance), color, saturationAmount);

  //  // Contrast (darks darker, brights brighter)
  //  float contrastAmount = t + 1.;
  //  float midpoint = .5; // lower midpoint -> more weight to brights, higher -> more weight to dark
  //  // remap of color from range [0,1] to [-.5, .5] * amount then back to [0,1]
  //  // clamp to make sure maps back to 0,1 as multiplier could take it out of range [-.5,.5]
  //  // color = saturate((color - midpoint) * contrastAmount + midpoint);
  //  // Any operation that pushes color values away from midpoint can be considered contrast (like smoothstep which makes middle steeper and pushes outer values towrads 0 and 1), problem is has no control over contrast level
  //  // color = mix(color, smoothstep(vec3(0.), vec3(1.), color), t);
  //  vec3 sg = sign(color - midpoint);
  //  // // Custom contrast curve
  //  // color = sg * pow(
  //  //   abs(color - midpoint) * 2.,
  //  //   vec3(1. / contrastAmount)
  //  // ) * .5 + midpoint;


   
vec4 brightness(vec3 color) {
  float b = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  vec3 c = color;
  if (uInvert == 1.) {
    b = 1. - b;
    c = 1. - c;
  }
  return vec4(c, clamp(b, 0., 1.));
}

vec2 getImgUv(vec2 p, float grid, float aspect) {
  vec2 ip = p;
  ip.y = 1. - ip.y;

  // if (aspect < 1.) {
  //   ip.y -= 1. - .5/grid;
  //   ip.y *= aspect;
  //   ip.y += 1. - .5/grid;
  // } else {
  //   ip.y -= 1. - .5/grid;
  //   ip.y *= aspect;
  //   ip.y += 1. - .5/grid;
  // }

  // ip += vec2(0.1);
    
  ip.y -= 1. - .5/grid;
  ip.y *= aspect;
  ip.y += 1. - .5/grid;

  ip = clamp(ip, 0., 1.);

  return ip;
}

vec4 getBrightness(vec2 p) {
  vec2 q = p;
  q.y = 1. - q.y;
  if (uMode == 0.) return brightness(texture(uImage, q).rgb);
  else if (uMode == 1.) return brightness(texture(uVideo, q).rgb);
  else if (uMode == 2.) return brightness(texture(uCamera, q).rgb);
  else if (uMode == 3.) return brightness(texture(uText, q).rgb);
  else return vec4(1.);
  // else if (uMode == 3.) return brightness(texture(uImage, p).rgb);
}

  float getNodeIso(vec2 uv, float i, float j, vec2 id, vec2 scale, vec2 aspectFactor, bool flip, float roundness, float threshold, float d) {
    float dir = flip ? -1. : 1.;
    float angle = angleBetween(vec2(.5, .5) * aspectFactor, vec2(1., 1.5) * aspectFactor) * dir;
    float oddA = mod(id.y, 2.) * uGrid;
    float oddB = mod(id.y + dir, 2.) * uGrid;
    vec2 offA = oddA * vec2(.5, 0.);
    vec2 offB = oddB * vec2(1.5, 0.);
    vec2 pA = (floor(uv * uQuantity) + vec2(i, j) + offA) / uQuantity;
    vec2 pB = (floor(uv * uQuantity) + vec2(i, j + dir) + offB) / uQuantity;
    vec2 pC = mix(pA, pB, .5);

    vec2 uv_ = uv;
    uv_ -= .5;
    uv_ *= aspectFactor;
    uv_ += .5;
    pC -= .5;
    pC *= aspectFactor;
    pC += .5;

    vec2 pD = rotate(uv_ - pC, angle);

    vec4 b = getBrightness(pC);
    // if (i == 0. && j == 0.) color = b.rgb;
    float sf = 1.;
    float lowY = flip ? 1. : 0.;
    if (id.x < 0. || id.y < lowY || id.x > uQuantity - 2. || id.y > uQuantity - 2.) sf = 0.;
    return min(d, sdRoundedBox(pD, scale * b.w * sf, vec4(roundness) * b.w * sf));
  }


  // Sqaure grid lines
  float getNodeSquare(vec2 uv, vec2 off, vec2 aspectFactor, bool vert, vec2 scale, float roundness, float threshold, float d) {
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

    vec2 scl = scale;
    if (vert) scl = scale.yx;

    vec2 p = (floor(uv * uQuantity) + off) / uQuantity;
    float sf = 1.;
    if (p.x < 0. || p.y < 0. || p.x > 1. || p.y > 1.) sf = 0.;
    vec4 b = getBrightness(p);
    // color = mix(bx.rgb, b0.rgb, mod(floor(uTime), 2.));
    vec2 uv_ = uv;
    uv_ -= .5;
    uv_ *= aspectFactor;
    uv_ += .5;
    p -= .5;
    p *= aspectFactor;
    p += .5;
    vec2 r = scl * b.w * sf;
    return min(d, sdRoundedBox(uv_ - p, r, vec4(roundness) * b.w * sf));
  }

  void main() {

    vec3 color = vec3(0.);

    float d0 = 1000000.;
    float d1 = 1000000.;

    float grid = uQuantity * 1.;
    float aspect = uViewport.x/uViewport.y;
    float threshold = .15;
    vec2 af = aspect < 1. ? vec2(1., 1./aspect) : vec2(aspect, 1.);

    float ascl = aspect < 1. ? 1./aspect : aspect;
    vec2 sbox = vec2(.5/uQuantity * ascl, .125/uQuantity * .5);
    sbox *= vec2(1., map(uDotSize, 0., 1., .5, 1.25));
    sbox *= vec2(1., map(uContrast, 0., 1., 1.25, .5));
    float roundness = .1/uQuantity;


    vec2 uv = vUv;
    uv.y = 1. - uv.y;
    // uv -= .5;
    // uv *= 1. + 1./34.;
    // uv += .5;
    uv -= vec2(.5)/grid;

    for (float i = -1.; i <= 1.; i++) {
      for (float j = -1.; j <= 1.; j++) {
        vec2 id = floor(uv * grid) + vec2(i, j);

        float odd = mod(id.y, 2.) * uGrid;
        vec2 off = odd * vec2(.5, 0.);

        // Circle
        vec2 p0 = (floor(uv * grid) + vec2(i, j) + off) / grid;
        // vec2 p0a = (floor((uv - vec2(.5)/grid) * grid) + vec2(i, j) + vec2(.5, 0.)) / grid;
        float sf0 = 1.;
        if (id.x < 0. || id.y < 0. || id.x > grid || id.y > grid || (uGrid == 1. && id.x == grid - 1. && odd == 1.)) sf0 = 0.;
        vec4 b0 = getBrightness(p0);
        if (i == 0. && j == 0.) color = b0.rgb;
        float b0f = b0.w;
        vec2 uv0 = uv;
        uv0 -= .5;
        uv0 *= af;
        uv0 += .5;
        p0 -= .5;
        p0 *= af;
        p0 += .5;
        float r = 1./grid*.25 * step(threshold, b0f) * b0f * sf0 * map(uDotSize, 0., 1., .5, 2.);
        // d0 = mix(d0, smoothUnionSDF(d0, sdCircle(uv0 - p0, r), .015), step(threshold, b0f));
        d0 = smoothUnionSDF(d0, sdCircle(uv0 - p0, r), .015);

        // Square grid lines
        if (id.x >= 0. && id.x < grid - 1. && uGrid == 0. && uConnectors.x == 1.) d1 = getNodeSquare(uv, vec2(i, j) + vec2(.5, .0), af, false, sbox, roundness, threshold, d1); // horizontal
        if (id.y >= 0. && id.y < grid - 1. && uGrid == 0. && uConnectors.y == 1.) d1 = getNodeSquare(uv, vec2(i, j) + vec2(.0, .5), af, true, sbox, roundness, threshold, d1); // vertical

        // Isometric grid lines
        if (uGrid == 1. && uConnectors.x == 1.) d1 = getNodeIso(uv, i, j, id, sbox, af, true, roundness, threshold, d1);
        if (uGrid == 1. && uConnectors.y == 1.) d1 = getNodeIso(uv, i, j, id, sbox, af, false, roundness, threshold, d1);
      }
    }

    float d = smoothUnionSDF(d0, d1, .01);
    d = smoothstep(0., .002, d);

    vec4 c = vec4(mix(uForegroundColor, mix(uForegroundColor, uBackgroundColor, uAlpha), d), mix(1.-d, 1., uAlpha));
    // gl_FragColor = vec4(max(color, vec3(1.-d)), 1.);
    gl_FragColor = c;


    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default fragmentShader;
