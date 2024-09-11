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

  // precision mediump float;


// vec4 getImage(sampler2D tex, vec2 uv, vec2 imageRes, vec2 resolution) {
//   vec4 image = vec4(0.);

//   vec2 texAspect = vec2(
//     imageRes.x > imageRes.y ? imageRes.x / imageRes.y : 1.,
//     imageRes.x > imageRes.y ? 1. : imageRes.y / imageRes.x
//   );

//   vec2 uvF = vec2(
//     imageRes.x / resolution.x,
//     imageRes.y / resolution.y
//   );
  
//   // Reset texture aspect
//   uv /= uvF;

//   float offSide = resolution.y / imageRes.y;

//   vec2 uvOff = vec2(
//     (resolution.x - imageRes.x * offSide),
//     (resolution.y - imageRes.y * offSide)
//   );

//   uvOff *= .5;
//   uvOff /= imageRes;

//   uv -= uvOff;
//   uv *= imageRes.y / resolution.y;

//   image = texture2D(tex, uv);

//   // Correct image gamma
//   image = sRGBTransferOETF(image);

//   // Crop edge of image if doesn't fit canvas
//   float bounds = 1.;
//   if (uv.x < 0. || uv.x >= 1. || uv.y < 0. || uv.y >= 1.) bounds = 0.;
//   image.a *= bounds;

//   return image;
// }

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

//   float sdTrapezoid( in vec2 p, in float r1, float r2, float he )
// {
//     vec2 k1 = vec2(r2,he);
//     vec2 k2 = vec2(r2-r1,2.0*he);
//     p.x = abs(p.x);
//     vec2 ca = vec2(p.x-min(p.x,(p.y<0.0)?r1:r2), abs(p.y)-he);
//     vec2 cb = p - k1 + k2*clamp( dot(k1-p,k2)/dot2(k2), 0.0, 1.0 );
//     float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
//     return s*sqrt( min(dot2(ca),dot2(cb)) );
// }

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
  if (uMode == 0.) return brightness(texture(uImage, p).rgb);
  else if (uMode == 1.) return brightness(texture(uVideo, p).rgb);
  else if (uMode == 2.) return brightness(texture(uCamera, p).rgb);
  else if (uMode == 3.) return brightness(texture(uText, p).rgb);
  else return vec4(1.);
  // else if (uMode == 3.) return brightness(texture(uImage, p).rgb);
}


  void main() {
    float grid = uQuantity * 1.;

    vec2 uv = vUv;
    uv.y = 1. - uv.y; // swap y+ to bottom of canvas so easier to work with cols/rows

    float aspect = uViewport.x/uViewport.y;

    // float scl = 1./sqrt(3.);
    vec2 scl = vec2(map(uDensity.x, 0., 1., .5, 1.), map(uDensity.y, 0., 1., .5, 1.));
    scl = vec2(1.);
    // if (uGrid == 1.) scl.y *= 1./sqrt(3.); // approx y ratio for iso grid
    uv -= .5;
    uv /= scl;
    uv += .5;

    uv -= vec2(.5/grid, .5/grid) * scl;


    // if (aspect >= 1.) {
    //   scl *= vec2(1., 1./aspect);
    // } else {
    //   scl *= vec2(1., 1./aspect);
    // }
    scl *= vec2(1., 1./aspect);
    

    // if (uv.y < scl / 2.) uv.y = 0.;
    // else if( uv.y < 1. - scl/2.) uv.y = map(uv.y, scl/2., 1.-scl/2., 0., 1.);
    // else uv.y = 1.;

    // uv.y = map(uv.y, 0., 1., -(1.-scl)/2., 1.+(1.-scl)/2.);
    // uv.y = map(uv.y, 1./(scl)/2., 1.-1./(scl)/2., 0., 1.);

    // remap uv.y to 0...0,1...0

    // get grid id for vUv
    // float x = floor(uv.x * grid);
    // float y = floor(uv.y * grid);

    // float i = x + y * grid;

    
    vec3 color = vec3(0.);


    // float r = 1./grid * .75 * mix(1., 1., mod(i, 2.));
    float d1 = 1000000.;
    float d2 = 1000000.;

    // for (float i = 0.; i < grid * grid; i++) {
    //   float x = mod(i, grid);
    //   float y = floor(i / grid);
    //   vec2 p = vec2(x, y) / grid;
    //   float l = length(uv - p - .5/grid);
    //   // if (l < r * 2.) d = min(d, sdCircle(uv - p - .5/grid, r / 4.));
    //   d = smoothUnionSDF(d, sdCircle(uv - p - .5/grid, r / 4.), r/1.5);
    // }

   vec2 iUv = floor(vUv * grid + 0.) / grid;


  float angle = angleBetween(vec2(.5, .5) * scl, vec2(1., 1.5) * scl);

    // Check neighbours - square
    for (float i = -1.; i <= 1.; i++) {
      for (float j = -1.; j <= 1.; j++) {
      float x_ = floor(uv.x * grid) + i;
      float y_ = floor(uv.y * grid) + j;
      float odd = mod(y_, 2.) * uGrid;
      float sf = 1.;
      if (x_ < 0. || x_ > grid - 1. || y_ < 0. || y_ > grid - 1. || (uGrid == 1. && odd == 1. && x_ > grid - 2.)) sf = 0.;
      // x_ = clamp(x_, 0., grid - 1.);
      // y_ = clamp(y_, 0., grid - 1.);
      // x_ = smoothstep(0., grid, x_) * grid;
      vec2 p = vec2(x_ + odd * .5, y_) / grid;
      p *= scl;
      // p.x *= aspect;
      float ii = x_ + y_ * grid;
      float t = sin(uTime * PI + mod(ii, 2.) * 0.) * .5 + .5;

      // vec2 ip = vec2((floor(uv.x * grid + i + .5) + odd * .5) / grid, (floor(uv.y * grid + j + .5)) / grid);
      // ip *= scl;
      vec2 ip = getImgUv(p, grid, aspect);
        
      // ip.y -= (.5/grid) * scl.x;

      // iUv = floor(vUv * grid + 0.) / grid;
      // iUv = floor(vUv * grid + vec2(i, j)) / grid;

      vec2 imgAspect = vec2(1118./924., 1.);
      // ip -= .5;
      // ip /= scl;
      // ip += .5;

      // vec2 uvF = vec2(
      //   imgAspect.x / aspect,
      //   imgAspect.y / 1.
      // );
    
      // ip -= .5;
      // ip *= uvF;
      // ip += .5;

      // if (aspect < 1.) {
      //   ip.y -= .5 * 1./aspect;
      //   ip.y *= 1./imgAspect;
      //   ip.y *= 1./aspect;
      //     ip.y += .5 * 1./aspect;
      // } else {
      //   ip.y -= .5;
      //   // ip.y *= imgAspect;
      //   // ip.y *= imgAspect;
      //   // ip.y *= aspect;
      //   ip.y += .5;

      // }

      // ip.y *= 1./imgAspect.x;
      // ip.y += .5;

      // ip -= .5;
      // ip /= imgAspect;
      // ip.y *= aspect;
      // ip += .5;
      // if (aspect >= 1.) {
      //   ip.y -= .5 * aspect;
      //   ip.y *= aspect;
      //   ip.y += .5 * aspect;
      // }

    

      //need to transform ip to uv [0, 1]

      // ip = clamp(ip, 0., 1.);
      // ip /= scl;

      // color = texture(uVideo, ip).rgb;
    // float b = brightness(color);
    vec4 b = getBrightness(ip);
    // b.w = smoothstep(b.w, .1, 1.);
    // vec4 b = getBrightness(iUv);
    color = b.rgb;
    // b = 1.;

    // float r2 = 1./grid * b * 1.5 * mix(1., 1., mod(ii, 2.)) * mix(.5, .75, t);
      float threshold = 1./grid * .5;
    float r2 = 1./grid * b.w * map(uDotSize, 0., 1., .5, 2.) * sf;
    bool render = r2 > threshold;
    render = b.w > .15;

      if (render) d1 = smoothUnionSDF(d1, sdCircle(uv * vec2(scl) - p - .5/grid * 0., r2 / 4.), 0.015); // 0.02
 
      vec4 round = vec4(.125/grid*.5);
      // vec2 s0 = vec2(.3/grid, .125/grid*.5) * t; 
      
      // vec2 q = uv * vec2(scl) - p - .5/grid * 0.;

      // vec2 qq = vec2(x_ + .5, y_) / grid;
      // vec2 s0 = vec2(.5/grid, .125/grid*.3) * 1.; 
      // vec2 q = uv * vec2(scl) - qq;
      // vec2 off = vec2(s0.x/1., 0.) * 0.;
      // vec2 ip2 = qq;
      // ip2.y = 1. - ip2.y;
      // float b2 = brightness(texture(uVideo, ip2).rgb);
      // s0 *= b2;

      // threshold = 0.;

      vec2 s0 = vec2(.5/grid, .125/grid*.5);
      s0.y *= mix(1.5, .333, uContrast); 

      // Horizontal
      if (uGrid == 0. && render && (uConnectors.x == 1. || uConnectors.y == 1.) ) {

        // vec2 s0 = vec2(.3/grid * t, .125/grid*.5 * mix(.5, 1., t));
        // vec2 q = uv * vec2(scl) - p - .5/grid * 0.;
        // vec2 off = vec2(s0.x/1., 0.);
      vec2 qq = vec2(x_ + .5, y_) / grid * scl;
      // qq.x *= aspect;
      vec2 qh = uv * vec2(scl) - qq - .5/grid * 0.;
        // vec2 q0 = q - off;

      vec2 ip2 = getImgUv(qq, grid, aspect);
      // float b2 = brightness(texture(uVideo, ip2).rgb);
      vec4 b2 = getBrightness(ip2);
      // vec4 b2 = getBrightness(floor((vUv + vec2(.5, 0.)/grid) * grid) / grid);
      // color = b2.rgb;
      // b2 = 1.;
      vec2 sh = s0 * b2.w * sf;
      // vec2 off = vec2(s0.x/1., 0.) * 0.;

        // vec2 q1 = q + off;
        // if (x_ < grid - 1.) d2 = min(d2, sdRoundedBox(q0, s0, round));
        // if (x_ > 0.) d2 = min(d2, sdRoundedBox(q1, s0, round));
        if (x_ < grid - 1. && uConnectors.x == 1.) d2 = min(d2, sdRoundedBox(qh, sh, round * mix(0.5, 1., b.w)));
  
        vec2 qqv = vec2(x_ , y_ + .5) / grid * scl;
        // qqv.x *= aspect;
        vec2 qv = uv * vec2(scl) - qqv - .5/grid * 0.;
          // vec2 q0 = q - off;
  
        vec2 ip3 = getImgUv(qqv, grid, aspect);
        // float b3 = brightness(texture(uVideo, ip3).rgb);
        vec4 b3 = getBrightness(ip3);
        // vec4 b3 = getBrightness(floor(vUv * grid) / grid + vec2(0., .5) / grid);
        // b3 = 1.;
        vec2 sv = vec2(s0.y, s0.x) * b3.w * sf;
        sv.y *= 1./aspect;

        // Vertical
        // vec2 s1 = vec2(s0.y, s0.x);
        // vec2 off1 = vec2(0., s1.y/1.) *0.;
        // vec2 q2 = q - off1;
        // vec2 q3 = q + off1;
        // if (y_ < grid - 1.) d2 = min(d2, sdRoundedBox(q2, s1, round));
        // if (y_ > 0.) d2 = min(d2, sdRoundedBox(q3, s1, round));
        if (y_ < grid - 1. && uConnectors.y == 1.) d2 = min(d2, sdRoundedBox(qv, sv, round * mix(.5, 1., b.w)));
      } 

      if (uGrid == 1. && render && (uConnectors.x == 1. || uConnectors.y == 1.)) {

        // Diagonal
        // vec2 s0 = vec2(.3/grid * t, .125/grid*.5 * mix(.5, 1., t)); // scale
      vec2 qq1a = vec2(x_ + odd * 1.5, y_) / grid * scl;
      vec2 qq1b = vec2(x_ + (mod(y_ - 1., 2.)) * .5, y_ - 1.) / grid * scl;
      vec2 qq1 = mix(qq1a, qq1b, .5);
        vec2 qqq1 = uv * vec2(scl) - qq1 - .5/grid * 0.;

      vec2 qq2a = vec2(x_ + odd * 1.5, y_) / grid * scl;
      vec2 qq2b = vec2(x_ + (mod(y_ + 1., 2.)) * .5, y_  +1.) / grid * scl;
      vec2 qq2 = mix(qq2a, qq2b, .5);
        vec2 qqq2 = uv * vec2(scl) - qq2 - .5/grid * 0.;

        vec2 off = vec2(s0.x/1., 0.) * 0.;
        // off *= b;


        vec2 ip4 = getImgUv(qq1, grid, aspect);
        // float b4 = brightness(texture(uVideo, ip4).rgb);
        vec4 b4 = getBrightness(ip4);
        // vec4 b4 = getBrightness(iUv);
        vec2 ip5 = getImgUv(qq2, grid, aspect);
      
        // float b5 = brightness(texture(uVideo, ip5).rgb);
        vec4 b5 = getBrightness(ip5);
        // vec4 b5 = getBrightness(iUv);

        vec2 s4 = s0 * b4.w * sf;
        s4.x *= 1./aspect;
        // else sv. *= 1./aspect;
        vec2 s5 = s0 * b5.w * sf;
        s5.x *= 1./aspect;



        vec2 q0 = rotate(qqq1, angle + uTime*0.) - off;
        // vec2 q1 = rotate(q, angle + uTime*0.) + off;
        vec2 q2 = rotate(qqq2, -angle + uTime*0.) - off;
        // vec2 q3 = rotate(q, -angle + uTime*0.) + off;
        // vec4 round = vec4(.125/grid*.5);
        // q += .5/grid;
        if (y_ > 0. && !(odd == 0. && x_ == grid - 1.) && uConnectors.y == 1.) d2 = min(d2, sdRoundedBox(q0, s4, round));
        // if (y_ < grid - 1. && !(odd == 0. && x_ == 0.)) d2 = min(d2, sdRoundedBox(q1, s0, round));
        if (y_ < grid - 1. && !(odd == 0. && x_ == grid - 1.) && uConnectors.x == 1.) d2 = min(d2, sdRoundedBox(q2, s5, round));
        // if (y_ > 0. && !(odd == 0. && x_ == 0.)) d2 = min(d2, sdRoundedBox(q3, s0, round));
      }

    }
  }


  //   // Check neighbours - iso
  //   for (float i = -1.; i <= 1.; i++) {
  //     for (float j = -1.; j <= 1.; j++) {
  //       // if (j == 0. && i == -1.) continue;
  //     float x_ = x + i;
  //     float y_ = y + j;
  //     float odd = mod(y_, 2.);
  //     if (x_ < 0. || x_ > grid - 1. || y_ < 0. || y_ > grid - 1. || (odd == 1. && x_ > grid - 2.)) continue;
  //     // float scl = .75;
  //     vec2 p = vec2(x_ + odd * .5, (y_ - (grid - 1.)/2.) * scl + (grid - 1.)/2.) / grid;
  //     // float l = length(uv - p - .5/grid);

  //     // p.y *= sqrt(3.);

  //   float ii = x_ + y_ * grid;


  //   float b = brightness(texture(uImage, p).rgb);

  //   float r2 = 1./grid * 1.;
    
  //     d1 = smoothUnionSDF(d1, sdCircle(uv - p - .5/grid, r2 / 4.), 0.02);


  //   float t = sin(uTime * PI) * .5 + .5;
  //     // Diagonal
  //     vec2 s0 = vec2(.3/grid * t, .125/grid*.5 * mix(.5, 1., t)); // scale
  //     vec2 q = uv;
  //     vec2 off = vec2(s0.x/1., 0.);
  //     vec2 q0 = rotate(q - p - .5/grid, angle + uTime*0.) - off;
  //     vec2 q1 = rotate(q - p - .5/grid, angle + uTime*0.) + off;
  //     vec2 q2 = rotate(q - p - .5/grid, -angle + uTime*0.) - off;
  //     vec2 q3 = rotate(q - p - .5/grid, -angle + uTime*0.) + off;
  //     // q += .5/grid;
  //     vec4 round = vec4(.125/grid*.5);
  //     if (y_ > 0. && !(odd == 0. && x == grid - 1.)) d2 = min(d2, sdRoundedBox(q0, s0, round));
  //     if (y_ < grid - 1. && !(odd == 0. && x == 0.)) d2 = min(d2, sdRoundedBox(q1, s0, round));
  //     if (y_ < grid - 1. && !(odd == 0. && x == grid - 1.)) d2 = min(d2, sdRoundedBox(q2, s0, round));
  //     if (y_ > 0. && !(odd == 0. && x == 0.)) d2 = min(d2, sdRoundedBox(q3, s0, round));
  //   }
  // }
  

  float d = smoothUnionSDF(d1, d2, .01);


  // d = sdBox(t, vec2(.25, .125));


  // vec2 t = uv;
  // // t += .5;
  // t -= .5;
  // t.y += 1. * (uv.y * 2. - 1.) * uv.x / .25;
  // // t /= .25;
  // // t -= .5;
  // // t *= 4.;
  // // t.y *= map(uv.x, 0., 1., 1., 2.);
  // // t /= .25;
  // // t -= .5;
  // // t.y *= mix(1., 2., uv.x);
  // // t.y -= .5 / .25 * mix(1.,2., uv.x);
  // // t.x -= .333 / .25 * mix(1.,2., uv.x);
  // // t -= .5 * vec2(2., 1.);
  // d = sdBox(t, vec2(.25, .25));
  // d = sdTrapezoid(uv - vec2(.5, .5), .25, .125, .25);

    // d = smoothstep(r/4. - .001, r/4., d);
    d = smoothstep(0., .002, d);
    // d = step(.001, d);

    // gl_FragColor = vec4(color, 1.);


    // gl_FragColor = vec4(mix(uForegroundColor, uBackgroundColor, d),1.);
    vec4 c = vec4(mix(uForegroundColor, mix(uForegroundColor, uBackgroundColor, uAlpha), d), mix(1.-d, 1., uAlpha));
    // gl_FragColor = vec4(mix(mix(uForegroundColor, uBackgroundColor, d), color, sin(uTime)*.5+.5), 1.);
    // gl_FragColor = vec4(mix(color, c.rgb, sin(uTime)*.5+.5), 1.);
    gl_FragColor = c;

    // gl_FragColor = texture(uImage, uv);


  // #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }

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
