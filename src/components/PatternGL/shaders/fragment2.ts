// SDF circle formula from https://iquilezles.org/articles/distfunctions2d/

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float PI;
  uniform float uGrid; // 0 = square, 1 = isometric
  uniform vec3 uNodeColor;
  uniform vec3 uBackgroundColor;
  uniform sampler2D uImage;
  uniform sampler2D uVideo;

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
   
float brightness(vec3 color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}


  void main() {
    float grid = 5.;

    vec2 uv = vUv;
    uv.y = 1. - uv.y; // swap y+ to bottom of canvas so easier to work with cols/rows


    // float scl = 1./sqrt(3.);
    vec2 scl = vec2(1.);
    if (uGrid == 1.) scl.y *= 1./sqrt(3.);
    uv -= .5;
    uv /= scl;
    uv += .5;

    uv -= vec2(.5/grid, .5/grid) * scl;

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


  float angle = angleBetween(vec2(.5, .5) * scl, vec2(1., 1.5) * scl);

    // Check neighbours - square
    for (float i = -1.; i <= 1.; i++) {
      for (float j = -1.; j <= 1.; j++) {
      float x_ = floor(uv.x * grid + i);
      float y_ = floor(uv.y * grid + j);
      float odd = mod(y_, 2.) * uGrid;
      if (x_ < 0. || x_ > grid - 1. || y_ < 0. || y_ > grid - 1. || (uGrid == 1. && odd == 1. && x_ > grid - 2.)) continue;
      vec2 p = vec2(x_ + odd * .5, y_) / grid;
      float ii = x_ + y_ * grid;
      float t = sin(uTime * PI + mod(ii, 2.) * 0.) * .5 + .5;
      p *= scl;

      // vec2 ip = vec2((floor(uv.x * grid + i + .5) + odd * .5) / grid, (floor(uv.y * grid + j + .5)) / grid);
      // ip *= scl;
      vec2 ip = p;
      ip.y = 1. - ip.y;
      color = texture(uVideo, ip).rgb;
    float b = brightness(color);

    // float r2 = 1./grid * b * 1.5 * mix(1., 1., mod(ii, 2.)) * mix(.5, .75, t);
    float r2 = 1./grid * b;

      d1 = smoothUnionSDF(d1, sdCircle(uv * vec2(scl) - p - .5/grid * 0., r2 / 4.), 0.015); // 0.02
 
      vec4 round = vec4(.125/grid*.5);
      // vec2 s0 = vec2(.3/grid, .125/grid*.5) * t; 
      // vec2 qq = vec2(x_ + .5, y_) / grid;
      vec2 s0 = vec2(.5/grid, .125/grid*.5) * b; 
      vec2 q = uv * vec2(scl) - p - .5/grid * 0.;
      // vec2 q = uv * vec2(scl) - qq - .5/grid * 0.;
      // vec2 ip2 = qq;
      // ip2.y = 1. - ip2.y;
      // float b2 = brightness(texture(uVideo, ip2).rgb);
      // s0 *= b2;
      vec2 off = vec2(s0.x/1., 0.) * 1.;

      // vec2 qq = vec2(x_ + .5, y_) / grid;
      // vec2 s0 = vec2(.5/grid, .125/grid*.3) * 1.; 
      // vec2 q = uv * vec2(scl) - qq;
      // vec2 off = vec2(s0.x/1., 0.) * 0.;
      // vec2 ip2 = qq;
      // ip2.y = 1. - ip2.y;
      // float b2 = brightness(texture(uVideo, ip2).rgb);
      // s0 *= b2;

      // Horizontal
      if (uGrid == 0. && r2 > 1./grid * .5) {

        // vec2 s0 = vec2(.3/grid * t, .125/grid*.5 * mix(.5, 1., t));
        // vec2 q = uv * vec2(scl) - p - .5/grid * 0.;
        // vec2 off = vec2(s0.x/1., 0.);
        vec2 q0 = q - off;
        vec2 q1 = q + off;
        if (x_ < grid - 1.) d2 = min(d2, sdRoundedBox(q0, s0, round));
        if (x_ > 0.) d2 = min(d2, sdRoundedBox(q1, s0, round));
        // if (x_ < grid - 1.) d2 = min(d2, sdRoundedBox(q0, s0, round));
  
        // Vertical
        vec2 s1 = vec2(s0.y, s0.x);
        vec2 off1 = vec2(0., s1.y/1.) *0.;
        vec2 q2 = q - off1;
        vec2 q3 = q + off1;
        if (y_ < grid - 1.) d2 = min(d2, sdRoundedBox(q2, s1, round));
        if (y_ > 0.) d2 = min(d2, sdRoundedBox(q3, s1, round));
        // if (y_ < grid - 1.) d2 = min(d2, sdRoundedBox(q2, s1, round));
      } 

      if (uGrid == 1. &&  r2 > 1./grid * .5) {

        // Diagonal
        // vec2 s0 = vec2(.3/grid * t, .125/grid*.5 * mix(.5, 1., t)); // scale
        // vec2 q = uv * vec2(scl) - p - .5/grid * 0.;
        // vec2 off = vec2(s0.x/1., 0.);

        vec2 q0 = rotate(q, angle + uTime*0.) - off;
        vec2 q1 = rotate(q, angle + uTime*0.) + off;
        vec2 q2 = rotate(q, -angle + uTime*0.) - off;
        vec2 q3 = rotate(q, -angle + uTime*0.) + off;
        // vec4 round = vec4(.125/grid*.5);
        // q += .5/grid;
        if (y_ > 0. && !(odd == 0. && x_ == grid - 1.)) d2 = min(d2, sdRoundedBox(q0, s0, round));
        if (y_ < grid - 1. && !(odd == 0. && x_ == 0.)) d2 = min(d2, sdRoundedBox(q1, s0, round));
        if (y_ < grid - 1. && !(odd == 0. && x_ == grid - 1.)) d2 = min(d2, sdRoundedBox(q2, s0, round));
        if (y_ > 0. && !(odd == 0. && x_ == 0.)) d2 = min(d2, sdRoundedBox(q3, s0, round));
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


    gl_FragColor = vec4(mix(uNodeColor, uBackgroundColor, d),1.);
    // gl_FragColor = vec4(mix(mix(uNodeColor, uBackgroundColor, d), color, sin(uTime)*.5+.5), 1.);
    // gl_FragColor = vec4(uv.x, 0., 0., 1.);


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
