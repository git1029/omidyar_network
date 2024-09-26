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
  // uniform sampler2D uColor;
  uniform sampler2D uVideo;
  uniform sampler2D uCamera;
  uniform sampler2D uText;
  uniform float uDotSize;
  uniform float uAlpha;
  uniform vec2 uDensity;
  uniform vec2 uConnectors;
  uniform float uContrast;
  uniform float uInvert;
  uniform vec3 uViewport;
  uniform float uDPR;
  // uniform vec3 uImageSize;
  uniform vec3 uInputAspect;
  uniform float uInputContrast;
  uniform float uInputBackground;


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

  float smin2( float a, float b, float k )
{
    k *= 16.0/3.0;
    float h = max( k-abs(a-b), 0.0 )/k;
    return min(a,b) - h*h*h*(4.0-h)*k*(1.0/16.0);
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

  vec3 contrast(vec3 color) {
   // Contrast (darks darker, brights brighter)
   float contrastAmount = map(uInputContrast, 0., 1., -.5, 1.5) + 1.;
   float midpoint = .5; // lower midpoint -> more weight to brights, higher -> more weight to dark
   // remap of color from range [0,1] to [-.5, .5] * amount then back to [0,1]
   // clamp to make sure maps back to 0,1 as multiplier could take it out of range [-.5,.5]
   // color = saturate((color - midpoint) * contrastAmount + midpoint);
   // Any operation that pushes color values away from midpoint can be considered contrast (like smoothstep which makes middle steeper and pushes outer values towrads 0 and 1), problem is has no control over contrast level
   // color = mix(color, smoothstep(vec3(0.), vec3(1.), color), t);
   vec3 sg = sign(color - midpoint);
   // Custom contrast curve
   return sg * pow(
     abs(color - midpoint) * 2.,
     vec3(1. / contrastAmount)
   ) * .5 + midpoint;
  }


   
vec4 brightness(vec3 color_) {
  vec3 color = color_;
  if (uMode < 3.) color = contrast(color);
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

  // Flip camera horizontally

  vec2 iUv = q;

  // // float imgScale = clamp(uImgScale, 50., 200.);
  // // imgScale = 1. / (imgScale / 100.);
  // // float imgScale = 1.;
  
  if (uMode == 2.) iUv.x = 1. - iUv.x; // flip camera horizontally
  
  // // Reset texture aspect
  iUv -= .5;

  // if (uMode == 0.) iUv.x /= uInputAspect.x;
  // else if (uMode == 1.) iUv.x /= uInputAspect.y;
  // iUv.x *= uViewport.z;

  float inputAspect = uMode == 0. ? uInputAspect.x : uMode == 1. ? uInputAspect.y : uMode == 2. ? uInputAspect.z : 1.;


  if (inputAspect >= 1.) iUv.x /= inputAspect;
  else iUv.y *= inputAspect;

  if (inputAspect >= uViewport.z) {
    // fit by height
    iUv.x *= uViewport.z;
  } else {
    // fit by width
    iUv.y /= uViewport.z;
  }


  iUv += .5;

  // float uImgFitWidth = 1.;

  // float offSide = uImgFitWidth == 1. ? uViewport.z / uTexAspect.x : 1. / uTexAspect.y;
  // // // offSide /= imgScale;

  // vec2 uvOff = vec2(
  //   (uViewport.x - uTexAspect.x * offSide),
  //   (1. - uTexAspect.y * offSide)
  // );

  // uvOff *= .5;
  // uvOff /= uTexAspect;

  // imgUv -= uvOff;
  // imgUv *= uImgFitWidth == 1. ? uTexAspect.x / uViewport.z : uTexAspect.y / 1.;
  // imgUv += uImgOffset;

  // if (imgUv.x < 0. || imgUv.x >= 1. || imgUv.y < 0. || imgUv.y >= 1.) discard; 


  // if (uMode == 0.) return brightness(texture(uImage, iUv).rgb);
  // else if (uMode == 1.) return brightness(texture(uVideo, iUv).rgb);
  // else if (uMode == 2.) return brightness(texture(uCamera, iUv).rgb);
  // else if (uMode == 3.) return brightness(texture(uText, q).rgb);
  // else return vec4(1.);

  return vec4(1.);
  // else if (uMode == 3.) return brightness(texture(uImage, p).rgb);
}

  float getNodeIso(vec2 uv, float i, float j, vec2 id, vec2 scale, vec2 aspectFactor, float af, bool flip, float roundness, float threshold, float d, float b) {
    float dir = flip ? -1. : 1.;
    float angle = angleBetween(vec2(.5, .5) * aspectFactor, vec2(1., 1.5) * aspectFactor) * dir;
    float oddA = mod(id.y, 2.) * uGrid;
    float oddB = mod(id.y + dir, 2.) * uGrid;
    vec2 offA = oddA * vec2(.5, 0.);
    vec2 offB = oddB * vec2(1.5, 0.);
    vec2 pA = (floor(uv * uQuantity) + vec2(i, j) + offA + 0.5) / uQuantity;
    vec2 pB = (floor(uv * uQuantity) + vec2(i, j + dir) + offB + 0.5) / uQuantity;
    vec2 pC = mix(pA, pB, .5);
    // vec4 b = getBrightness(pC);
    // if (i == 0. && j == 0.) color = b.rgb;

    vec2 uv_ = uv;
    uv_ -= .5;
    uv_ *= aspectFactor;
    uv_ += .5;
    pC -= .5;
    pC *= aspectFactor;
    pC += .5;

    vec2 pD = rotate(uv_ - pC, angle);

    float sf = 1.;
    float lowY = flip ? 1. : 0.;
    float highY = flip ? 1. : 2.;
    if (id.x < 0. || id.y < lowY || id.x > uQuantity - 2. || id.y > uQuantity - highY) sf = 0.;

    vec2 scl = scale;


    float a = uViewport.z;
    if (a < 1.) scl.x /= a;
    else scl.x *= a;

    // scl.x *= af;
    scl *= b * sf;

    return mix(d, min(d, sdRoundedBox(pD, scl, vec4(roundness) * b * sf)), step(threshold, b) * sf);
  }


  // Sqaure grid lines
  float getNodeSquare(vec2 uv, vec2 off, vec2 aspectFactor, bool vert, vec2 scale, float roundness, float threshold, float d, float b) {
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
    if (vert && a < 1.) scl.x /= a;
    if (!vert && a >= 1.) scl.x *= a;
    if (vert) scl = scl.yx;

    vec2 p = (floor(uv * uQuantity) + off) / uQuantity;
    float sf = 1.;
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

  void main() {

    vec3 color = vec3(0.);

    float d0 = 10000.;
    float d1 = 10000.;

    float grid = uQuantity * 1.;
    float uMaxCount = 30.;

    // float grid = 2.;
    float aspect = uViewport.z * 1.;
    float threshold = .15;
    vec2 af = aspect < 1. ? vec2(1., 1./aspect) : vec2(aspect, 1.);

    float ascl = aspect < 1. ? 1./aspect : aspect;
    vec2 sbox = vec2(.5/uQuantity, .125/uQuantity * .5);
    sbox *= vec2(1., map(uDotSize, 0., 1., .5, 1.25));
    sbox *= vec2(1., map(uContrast, 0., 1., 1.25, .5));
    float roundness = .1/uQuantity;


    vec2 edge = vec2(1./34.) / af;
    vec2 uv = vUv;
    uv.y = 1. - uv.y;
    uv -= .5;
    uv *= 1. + edge * map(uQuantity, 0., uMaxCount, 1., 2.);
    uv += .5;
    // uv -= vec2(.5)/grid;

    for (float i = -1.; i <= 1.; i++) {
      for (float j = -1.; j <= 1.; j++) {
        vec2 id = floor(uv * grid) + vec2(i, j);

        float odd = mod(id.y, 2.) * uGrid;
        vec2 off = odd * vec2(.5, 0.);

        // Circle
        vec2 p0 = (floor(uv * grid) + vec2(i, j) + off + 0.500) / grid;
        // vec2 p0a = (floor((uv - vec2(.5)/grid) * grid) + vec2(i, j) + vec2(.5, 0.)) / grid;
        float sf0 = 1.;
        // if (id.x < 0. || id.y < 0. || id.x >= grid || id.y >= grid) sf0 = 0.;
        // if (uGrid == 1. && id.x >= grid - 1. && odd == 1.) sf0 = 0.;
        // if (uGrid == 1. && id.x >= grid && odd == 0.) sf0 = 0.;
        // if (uGrid == 1. && id.y >= grid) sf0 = 0.;
        vec2 p0b = (floor(uv * grid) + vec2(i, j) + off + 0.500) / grid;
        vec4 b0 = getBrightness(p0b);
        if (i == 0. && j == 0.) color = b0.rgb;
        float b0f = b0.w;
        vec2 uv0 = uv;
        uv0 -= .5;
        uv0 *= af;
        uv0 += .5;
        // p0 -= .5;
        // p0 *= af;
        // p0 += .5;
        float r = 1./grid*.25 * b0f * map(uDotSize, 0., 1., .5, 1.75);
        d0 = mix(d0, smoothUnionSDF(d0, sdCircle(uv0 - p0, r), .015 * mix(1., .5, uQuantity/uMaxCount)), step(threshold, b0f) * sf0);
        // d0 = min(d0, sdCircle(uv0 - p0, r));

        // // // Square grid lines
        // if (id.x >= 0. && id.x < grid - 1. && uGrid == 0. && uConnectors.x == 1.) d1 = getNodeSquare(uv, vec2(i, j) + vec2(.5, .0) + 0.500, af, false, sbox, roundness, threshold, d1, b0.w); // horizontal
        // if (id.y >= 0. && id.y < grid - 1. && uGrid == 0. && uConnectors.y == 1.) d1 = getNodeSquare(uv, vec2(i, j) + vec2(.0, .5) + 0.5, af, true, sbox, roundness, threshold, d1, b0.w); // vertical

        // // // Isometric grid lines
        // if (uGrid == 1. && uConnectors.x == 1.) d1 = getNodeIso(uv, i, j, id, sbox, af, ascl, true, roundness, threshold, d1, b0.w);
        // if (uGrid == 1. && uConnectors.y == 1.) d1 = getNodeIso(uv, i, j, id, sbox, af, ascl, false, roundness, threshold, d1, b0.w);
      }
    }

    float d = smoothUnionSDF(d0, d1, .01 * mix(1., .5, uQuantity/uMaxCount));
    // float d = d0;
    d = smoothstep(0., .002, d);

    // float alpha = 1.;
    // if (vUv.x < edge.x || vUv.x > 1.-edge.x || vUv.y < edge.y || vUv.y > 1.-edge.y) alpha = 0.;


    vec3 backgroundColor = uBackgroundColor;
    if (uInputBackground == 1. && uMode < 3.) {
      float inputAspect = uMode == 0. ? uInputAspect.x : uMode == 1. ? uInputAspect.y : uMode == 2. ? uInputAspect.z : 1.;
      vec2 imgUv = vUv;

      if (uMode == 2.) imgUv.x = 1. - imgUv.x; // flip camera horizontall

      imgUv -= .5;
      
      if (inputAspect >= 1.) imgUv.x /= inputAspect;
      else imgUv.y *= inputAspect;

      if (inputAspect >= uViewport.z) {
        // fit by height
        imgUv.x *= uViewport.z;
      } else {
        // fit by width
        imgUv.y /= uViewport.z;
      }
      imgUv += .5;
  
      if (uMode == 0.) backgroundColor = texture(uImage, imgUv).rgb;
      else if (uMode == 1.) backgroundColor = texture(uVideo, imgUv).rgb;
      else if (uMode == 2.) backgroundColor = texture(uCamera, imgUv).rgb;

      // backgroundColor = sRGBTransferOETF(vec4(backgroundColor, 1.)).rgb;
      backgroundColor = pow(backgroundColor, vec3(2.2));
    }


    vec3 c = mix(uForegroundColor, backgroundColor, uAlpha); // if alpha background mix use node color
    c = mix(uForegroundColor, c, d); // mix with distance to nodes/circles
    // c = mix(uBackgroundColor, c, alpha);
    // vec4 col = vec4(c, mix(1.-d, 1., uAlpha) * mix(alpha, 1., uAlpha));
    vec4 col = vec4(c, mix(1.-d, 1., uAlpha));
    // gl_FragColor = vec4(max(color, vec3(1.-d)), 1.);
    // gl_FragColor = vec4(mix(color, vec3(1., 0., 0.) * (1.-d), 1.-d), 1.);





    gl_FragColor = col;
    
    // vec2 imgUv = uv;
    // imgUv.y = 1. - imgUv.y;
    // imgUv -= .5;
    // imgUv.x /= uImageSize.z;
    // imgUv.x *= uViewport.z;
    // imgUv += .5;
    // gl_FragColor = texture(uImage, imgUv);


    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default fragmentShader;
