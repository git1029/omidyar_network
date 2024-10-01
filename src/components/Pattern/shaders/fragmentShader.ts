const fragmentShader = /*glsl*/ `
  uniform sampler2D uTex;
  uniform sampler2D uTex2;
  uniform vec3 uColor;
  uniform vec3 uColorText;
  // uniform float uAlpha;
  uniform vec2 uEffect;
  uniform float uTime;
  uniform float uBlendText;
  uniform float uCapture;
  uniform float PI;
  uniform float uText;
  varying vec2 vUv;
  varying vec3 vPos;
  varying float y;
  varying float id;

  mat4 rotation3d(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
  
    return mat4(
      oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
      0.0,                                0.0,                                0.0,                                1.0
    );
  }

  vec2 proj2(vec3 p) {
    vec3 camPos = vec3(0., 0., 1.);
    float F = p.z - camPos.z;
    float X = (p.x - camPos.x) * (F/p.z) + camPos.x;
    float Y = (p.y - camPos.y) * (F/p.z) + camPos.y;
    return vec2(X, Y);
  }


vec2 proj(vec3 p) {
  // camera position
  vec3 cp = vec3(0., 0., 10.); // 0

  float X = p.x - cp.x;
  float Y = p.y - cp.y;
  float Z = p.z - cp.z;

  // camera rotation
  vec3 cr = vec3(0., 0., PI);

  float Cx = cos(cr.x); // cos(θx)
  float Cy = cos(cr.y); // cos(θy)
  float Cz = cos(cr.z); // cos(θz)

  float Sx = sin(cr.x); // cos(θx)
  float Sy = sin(cr.y); // cos(θy)
  float Sz = sin(cr.z); // cos(θz)

  vec3 D = vec3(
    Cy * (Sz * Y + Cz * X) - Sy * Z,
    Sx * (Cy * Z + Sy * (Sz * Y + Cz * X)) + Cx * (Cz * Y + Sz * X),
    Cx * (Cy * Z + Sy * (Sz * Y + Cz * X)) - Sx * (Cz * Y + Sz * X)
  );

  vec3 E = vec3(0., 0., 10.);

  float x2d = (E.z / D.z) * D.x - E.x; // Adding WIDTH/2 to center the camera
  float y2d = (E.z / D.z) * D.y - E.y; // Adding HEIGHT/2 to center the camera

  return vec2(x2d, y2d);
}

  // vec2 proj(vec3 p) {
  //   // camera position
  //   vec3 camPos = vec3(0.,0., 10000.); // 935.307436087194

  //   float X = p.x - camPos.x;
  //   float Y = p.y - camPos.y;
  //   float Z = p.z - camPos.z;

  //   // camera rotation
  //   // vec3 cr = normalize(-camPos);
  //   vec3 cr = vec3(0., 0., PI);

  //   vec3 C = cos(cr);
  //   vec3 S = sin(cr);

  //   vec3 D = vec3(
  //     C.y * (S.z*Y + C.z*X) - S.y*Z,
  //     S.x * (C.y*Z + S.y * (S.z*Y + C.z*X)) + C.x * (C.z*Y + S.z*X),
  //     C.x * (C.y*Z + S.y * (S.z*Y + C.z*X)) - S.x * (C.z*Y + S.z*X)
  //   );

  //   // vec3 E = vec3(0, 0, 935.307436087194)

  //   float x2d = -camPos.z/D.z * D.x - camPos.x;  // Adding WIDTH/2 to center the camera
  //   float y2d = -camPos.z/D.z * D.y - camPos.y; // Adding HEIGHT/2 to center the camera

  //   return vec2(x2d, y2d);
  // }

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  vec3 rotate(vec3 uv, vec3 axis, float angle) {
    // if (angle == .0) return vec3(uv, 0.); 
    return (vec4(uv, 1.) * rotation3d(axis, angle)).xyz;
  }


  float nearestHalfUp(float x) {
    float f = fract(x);
    if (x < 0.5) return ceil(x) - .5;
    else return ceil(x);
  }

  float cubicInOut(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
  }
  float quarticInOut(float t) {
    return t < 0.5
      ? +8.0 * pow(t, 4.0)
      : -8.0 * pow(t - 1.0, 4.0) + 1.0;
  }


   mat4 makeFrustum(float fovY, float aspectRatio, float front, float back)
{
    const float DEG2RAD = acos(-1.0) / 180.;

    float tangent = tan(fovY/2. * DEG2RAD);    // tangent of half fovY
    float top = front * tangent;              // half height of near plane
    float right = top * aspectRatio;          // half width of near plane

    // params: left, right, bottom, top, near(front), far(back)
    mat4 matrix = mat4(
      front / right, 0., 0., 0.,
      0., front / top, 0., 0.,
      0., 0.,  -(back + front) / (back - front), -(2. * back * front) / (back - front),
      0., 0., -1., 0.
    );
    return matrix;
}

vec3 rot(vec3 point, vec3 angle) {
  mat3 projection = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  );

  mat3 rotationX = mat3(
    1, 0, 0,
    0, cos(angle.x), -sin(angle.x),
    0, sin(angle.x), cos(angle.x)
  );

  mat3 rotationY = mat3(
   1./cos(angle.y), 0, 1./sin(angle.y),
    0, 1, 0,
    -1./sin(angle.y), 0, 1./cos(angle.y)
  );

  // mat3 rotationY = mat3(
  //   cos(angle.y), 0, sin(angle.y),
  //    0, 1, 0,
  //    -sin(angle.y), 0, cos(angle.y)
  //  );
 

  mat3 rotationZ = mat3(
    cos(angle.z), -sin(angle.z), 0,
    sin(angle.z), cos(angle.z), 0,
    0, 0, 1
  );

  vec3 rotated =  point * rotationY;
  rotated = rotationX * rotated;
  rotated = rotationZ * rotated;
  return projection * rotated;
}


vec3 rot2(vec3 point, vec3 angle) {
  mat3 projection = mat3(
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  );

  mat3 rotationX = mat3(
    1, 0, 0,
    0, cos(angle.x), -sin(angle.x),
    0, sin(angle.x), cos(angle.x)
  );

  mat3 rotationY = mat3(
   cos(angle.y), 0, sin(angle.y),
    0, 1, 0,
    -sin(angle.y), 0, cos(angle.y)
  );

  mat3 rotationZ = mat3(
    cos(angle.z), -sin(angle.z), 0,
    sin(angle.z), cos(angle.z), 0,
    0, 0, 1
  );

  vec3 rotated =  point * rotationY;
  rotated = rotationX * rotated;
  rotated = rotationZ * rotated;
  return projection * rotated;
}

vec4 getTime(float steps, float ld, float off, float dmax) {
  float ts = off;
  float te = ts + ld;
  // float dmax = ld * steps;
  // float time = mod(uTime, dmax);        
  float time = mod(uTime, nearestHalfUp(dmax));
  float tmax = time / dmax;
  float t2 = 0.;
  if (time < ts) t2 = 0.;
  else if (time < ts + ld * steps) t2 = map(time, ts, ts + ld * steps, 0., 1.);
  else t2 = 1.;
  
  float t = mod(t2 * steps, 1.);
  t = pow(cubicInOut(t), 1.);

  float s = floor((t2) * steps);

  return vec4(t2, t, s, tmax);
}

  void main() {
    vec4 color = vec4(uColor, 0.);
    float uCount = mix(1., 10., uEffect.x);
    for (float i = 0.; i < uCount; i++) {
      // vec2 uvv = vUv;
      // uvv.y -= .5;
      float ld = 4.;
      float off = i/uCount * 1.;
      float ts = off;
      float te = ts + ld;
      float time = mod(uTime + off, 4.);
      float t = 0.;
      if (time < ts) t = 0.;
      else if (time < te) t = map(time, ts, te, 0., 1.);
      else t = 1.;

      t = mod(uTime + off, ld) / ld;

      // float angle = mix(-PI/2., 0., t);
      // vec3 axis = vec3(0., 1., 0.);
      // vec3 u0 = rotate(vec3(vUv * 2. - 1., 0.), axis, mix(-3.14159/4., 0., t));
      // vec2 vv = vUv;
      // vv -= .5;
      // vv *= 4.;
      // vv += .5; 
      vec3 a = vec3(0., mix(PI/.5, 0., t), 0.);
      // vec3 u0 = rot(vec3(vUv - .5, 0.), a);
      // u0 /= 4.;
      // vec2 pp = proj(u0 - vec3(0., 0., -0.)) + .5;
      // pp = clamp(pp, 0., 1.);
      // if (pp.x > 1.) discard;
      // pp.y += .5;
      // vec2 uv = pp;
      // uv -= .5;
      // uv *= 1. + i/uCount * .6 * (sin(uTime)*.5+.5);
      // uv += .5;

      // vec2 uv = vUv;
      // uv -= .5;
      // // uv.y *= mix(1., 2., vUv.x);
      // // uv *= 2.;
      // uv += .5;
      // vec2 pivot = vec2(.5, .5);
      // vec3 vvv = vec3(uv - pivot, 0.);
      // vvv = rot(vvv, a);
      // vec3 vvv2 = rot2(vec3(uv - pivot, 0.), a);
      // // mat4 makeFrustum(float fovY, float aspectRatio, float front, float back)
      // // vec2 pp = (vec4(vvv, 1.) * makeFrustum(75., 1., 2., -2.)).xy;
      // vec2 pp = proj(vvv) + pivot;

      // // vvv -= .5;
      // // vvv /= 1.0 - clamp(abs(vvv.z), 0., 1.) * sign(vvv.z) * 1.;
      // // vvv += .5;
      // // vvv.y -= .5;
      // // vvv.y *= mix(.5, 2., (vvv2.z * .5 + .5) * 1.);
      // vvv.y *= mix(.5, 2., map(vvv2.z, -.5, .5, 0., 1.));
      // // vvv.y += .5;
      // uv = vvv.xy + pivot;
      // uv = pp;

      // uv -= .5;
      // uv.y *= mix(1., 2., vvv2.z);
      // uv +=5.;

      // uv.x = map(vUv.x, 0., 1., pp.x, 1.);

      // if (vUv.x () uv.x) discard;/
      // uv.x = map(uv.x, 0., 1., .25, .75);

      // vec2 mn = vec2(0, 0.);
      // vec2 mx = vec2(1., 1.);
      // vec3 mn2 = rot(vec3(mn - pivot, 0.), a);
      // vec2 mnp = proj(mn2) + pivot;
      // vec3 mx2 = rot(vec3(mx - pivot, 0.), a);
      // vec2 mxp = proj(mx2) + pivot;

      // uv.y = pp.y;
      // uv.y = map(vUv.y, mnp.y, mxp.y, 0., 1.);
      // uv.x = map(vUv.x, mnp.x, mxp.x, 0., 1.);

      // uv.x = map(vvv.x, mn2.x, mx2.x, 0., 1.); 
      // uv.y = map(vvv.y, mn2.y, mx2.y, 0., 1.); 

      // uv = clamp(uv, 0., 1.);
      // uv = vvv.xy + pivot;
      // if (uv.x > 1.) discard;
      // if (uv.y > 1.) discard;
      // if (uv.x < 0.) discard;
      // if (uv.y < 0.) discard;

      // vec2 puv = vUv;
      // puv.y -= 0.5;
      // puv /= 1.0 - puv.x * mix(2., 0., puv.x);
      // puv.y += 0.5;
      // vec2 pivot = vec2(.5, .5);
      // vec3 vvv = vec3(uv - pivot, 0.);
      // vvv = rot(vvv, a);
      // // vvv.xy += pivot;
      // vec2 pp = proj(vvv) + pivot;

      // vvv.y -= .5;
      // vvv.y *= mix(1., mix(1., .2, vvv.x), 1.-t);
      // vvv.y += .5;

      // t = mod(uTime + off, ld) / ld;
      // float f = t;
      // vec2 v2 = vUv;
      // v2 -= .5;
      // v2.x *= 1./f;
      // v2.y *= mix(1., mix(2., .5, vUv.x), 1.-f); 
      // v2 += .5;
      // vvv.x = (u0.x/2.)/(u0.z*1.)/2.;
      // vvv.y = (u0.y/2.)/(u0.z*1.)/2.;
      // vvv -= .5;
      // vvv *= mix(1., mix(.1, 2., vUv.x), i/uCount);
      // vvv += .5;

      // u0.x *= 1./a.y;
      // u0.x = 100./u0.x;
      // vec4 c = texture(uTex, u0.xy * 4. + .5);

      vec2 uv = vUv;

      if(uEffect.x == 1.) {
        if (uEffect.y == 0.) {
          float steps = 4.;
          float ld = 1.;
          float off = 0.;
          off *= (ld/1.);
          float dmax = ld * steps + 0.;
          vec4 time = getTime(steps, ld, off, dmax);
          float t = time.y;
          float s = time.z;

          float scl = mix(1., 2., i/uCount);
          float scl0 = scl;

          if (s == 0.) scl0 = mix(1., scl, t);
          else if (s == 1.) scl0 = scl;
          else if (s == 2.) scl0 = mix(scl, 1., t);
          else if (s == 3.) scl0 = 1.;

          uv -= .5;
          uv *= scl0;
          uv += .5;
        }

  
        if (uEffect.y == 1.) {
          float steps = 4.;
          float ld = 1.5;
          float off = i/uCount * .5;
          off *= (ld/1.5);
          float dmax = ld * steps + .5;
          vec4 time = getTime(steps, ld, off, dmax);
          float t = time.y;
          float s = time.z;

          float theta = PI/8. + mix(1., 0., i/uCount) * PI/5.;
          float angle = 0.;
          if (s == 0.) angle = mix(0., -theta, t);
          else if (s == 1.) angle = mix(-theta, 0., t);
          else if (s == 2.) angle = mix(0., theta, t);
          else if (s == 3.) angle = mix(theta, 0., t);

          float sclf = 1.1;
          float scl = 1.;
          if (s == 0. || s == 2.) scl = mix(1., sclf, t);
          else if (s == 1. || s == 3.) scl = mix(sclf, 1., t);


          vec3 a = vec3(0., angle, 0.);

          vec3 r = rot2(vec3(vUv * 2. - 1., 0.), a);
          vec3 r0 = rot(vec3(vUv * 2. - 1., 0.), a);
          float fy = map(r.z, -1., 1., 1.5, .5);
          if (abs(angle) > 0.) uv.xy = r0.xy * .5 + .5;
          uv -= .5;
          uv *= scl;
          uv.y *= fy;
          uv += .5;
        }


        if (uEffect.y == 2.) {
          // uv -= .5;
          // uv.y /= 1.0 - uv.x * 2.;
          // uv.x *= 

          float steps = 2.;
          float ld = 1.5;
          float off = i/uCount * 1.;
          off *= (ld/1.5);
          float dmax = ld * steps + 1.;
          vec4 time = getTime(steps, ld, off, dmax);
          float t = time.y;
          float s = time.z;

          vec2 pivot = vec2(-0.1, .5);
          if (s == 1.) pivot = vec2(1.1, .5);
          // if (s == 1.) pivot = vec2(0.);

          float scl = mix(1.2, 1., t);
          if (s == 1.) scl = mix(1., 1.2, t);
          scl = 1.;
          float offx = mix(-.2, 0., t);
          if (s == 1.) offx = mix(0., .2, t);
          float angle = mix(-PI/2., 0., t);
          // if (s == 1.) angle = 0.;
          if (s == 1.) angle = mix(0., -PI/2., t);
          vec3 a = vec3(0., angle, 0.);
          // float z = mix(.1, 0., t);
          // if (s == 1.) z = mix(.0, .1, t);
          vec3 r0 = rot(vec3(uv - pivot, 0.), a);
          uv -= .5;
          if (s == 0.) uv.y /= mix((1.0 - uv.x * .0) * mix(1., 0.5, vUv.x), 1., t);
          if (s == 1.) uv.y /= mix((1.0 - uv.x * .0) * mix(1., .5, 1.-vUv.x), 1., 1.-t);
          uv *= scl;
          uv += .5;
          if (abs(angle) > 0.) uv.x = r0.x + pivot.x - offx * 1.;
          // uv += .5;
        }

        if (uEffect.y == 3.) {
          float steps = 4.;
          float ld = 1.;
          float off = i/uCount * .5;
          off *= (ld/1.);
          float dmax = ld * steps + .5;
          vec4 time = getTime(steps, ld, off, dmax);
          float t = time.y;
          float s = time.z;

          float scl0 = (1. + length(vUv * 2. - 1.)) * .5;
          // scl *= mix(1.25, .25, i/uCount);
          float scl = .25;

          uv -= .5;
          uv *= scl0;
          if (s == 0.) uv *= mix(1., scl, t);
          else if (s == 1.) uv *= scl;
          else if (s == 2.) uv *= mix(scl, 1., t);
          else if (s == 3.) uv *= 1.;
          uv += .5;
        }
      }

  


      vec4 c = texture(uTex, uv);
      vec4 cc = vec4(uColor, c.a);

      // color = max(color, cc);
      // color = vec4(c.rgb * al + (1.-al) * color.rgb, max(c.a, color.a));
      if (uEffect.x == 0.) {
        color = cc;
      }
      else {
        // if (uEffect.y == 1.) {
        //   c.a *= mix(1., .2, i/uCount);
        // } else {
        //   c.a *= 0.65;
        // }
        c.a *= 0.65;
        float alpha = (c.a + color.a * (1. - c.a));
        vec3 col = (uColor * c.a + uColor * color.a * (1. - c.a)) / alpha;
        color = vec4(col, alpha);
      }


      // color = vec4(vec3(map(vvv2.z, -.5, .5, 0., 1.)), 1.);
      // color = c;
    }
    // vec3 r = rot2(vec3(vUv * 2. - 1., 0.), vec3(0., uTime + id * .1, 0.));
    // float fy = map(r.z, -1., 1., 1.5, .5);
    // vec2 uv = vUv;
    // uv -= .5;
    // uv.y *= fy;
    // uv += .5;
          // if (uv.x > 1.) discard;
      // if (uv.y > 1.) discard;
      // if (uv.x < 0.) discard;
      // if (uv.y < 0.) discard;
      if (uText == 1.) {
        vec4 text = texture(uTex2, vUv);
        // text.rgb = mix(text.rgb, mix(text.rgb, color.rgb, .4), color.a);
        vec3 textColor = mix(uColorText, mix(uColorText, uColor, .4), color.a * uBlendText);
        color.rgb = mix(color.rgb, textColor, text.a);
        color.a = max(color.a, text.a);
      }

      // color += text;
      // color = clamp(color, 0., 1.);

    //   vec4 c = texture(uTex, uv);
    // gl_FragColor = vec4(uColor, c.a - id/7. * .5);
    // gl_FragColor = vec4(1., 0., 0., 1.);
    if (uCapture == 1.) color.a *= 0.;
    // color.a *= .4;

    
    gl_FragColor = color;
    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default fragmentShader;
