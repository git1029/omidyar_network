import getImage from "../../Background/shaders/partials/getImage";

const fragmentShader = /*glsl*/ `
  uniform sampler2D uPattern;
  uniform sampler2D uText;
  uniform vec3 uColor;
  uniform vec3 uColorText;
  uniform vec3 uEffect;
  uniform float uTime;
  uniform float uBlendText;
  uniform float uCapture;
  uniform float PI;
  uniform float uTextEnabled;
  varying vec2 vUv;
  varying vec3 vPos;
  varying float y;
  varying float id;

  uniform sampler2D uImage;
  uniform sampler2D uVideo;
  uniform sampler2D uCamera;
  uniform float uMode;
  uniform sampler2D uExport;
  uniform float uExporting;
  uniform vec3 uViewport;
  uniform vec2 uResolution;
  uniform vec3 uInputAspect;
  uniform float uInputBackground;
  uniform float uBackgroundEffect;

  ${getImage}

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

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  vec3 rotate(vec3 uv, vec3 axis, float angle) {
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

  mat4 makeFrustum(float fovY, float aspectRatio, float front, float back) {
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
    float edge = 0.;
    float uCount = mix(1., 10., uEffect.x);

    for (float i = 0.; i < uCount; i++) {
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

      vec3 a = vec3(0., mix(PI/.5, 0., t), 0.);
    
      vec2 uv = vUv;
      float t_ = 0.;

      if(uEffect.x == 1.) {
        if (uEffect.y == 0.) {
          float steps = 4.;
          float ld = 1.;
          float off = 0.;
          off *= (ld/1.);
          float dmax = ld * steps + 0. * ld/1.;
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
          float dmax = ld * steps + .5 * ld/1.5;
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

          float scl = mix(1.2, 1., t);
          if (s == 1.) scl = mix(1., 1.2, t);
          scl = 1.;
          float offx = mix(-.2, 0., t);
          if (s == 1.) offx = mix(0., .2, t);
          float angle = mix(-PI/2., 0., t);
          if (s == 1.) angle = mix(0., -PI/2., t);
          vec3 a = vec3(0., angle, 0.);
          vec3 r0 = rot(vec3(uv - pivot, 0.), a);
          uv -= .5;
          if (s == 0.) uv.y /= mix((1.0 - uv.x * .0) * mix(1., 0.5, vUv.x), 1., t);
          if (s == 1.) uv.y /= mix((1.0 - uv.x * .0) * mix(1., .5, 1.-vUv.x), 1., 1.-t);
          uv *= scl;
          uv += .5;
          if (abs(angle) > 0.) uv.x = r0.x + pivot.x - offx * 1.;
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
          float scl = .25;

          uv -= .5;
          uv *= scl0;
          if (s == 0.) uv *= mix(1., scl, t);
          else if (s == 1.) uv *= scl;
          else if (s == 2.) uv *= mix(scl, 1., t);
          else if (s == 3.) uv *= 1.;
          uv += .5;

          if (s == 0.) t_ = t;
          else if (s == 1.) t_ = 1.;
          else if (s == 2.) t_ = 1. - t;
          else if (s == 3.) t_ = 0.;
        }
      }

      vec4 c = texture(uPattern, uv);
      edge = max(edge, c.r);
      vec4 cc = vec4(uColor, c.a);

      if (uEffect.x == 0.) {
        color = cc;
      }
      else {
        // Smooth pixelation on effect 4 zoom
        if (uEffect.y == 3.) {
          c.a = mix(c.a, smoothstep(.5, 1., c.a), t_ * .5 + .5);
        }

        c.a *= mix(0.65, 1., (uInputBackground == 1. && uBackgroundEffect > 0.) ? 1. : 0.);
        float alpha = (c.a + color.a * (1. - c.a));
        vec3 col = (uColor * c.a + uColor * color.a * (1. - c.a)) / alpha;
        color = vec4(col, alpha);
      }
    }

    if (uMode != 3. && uInputBackground == 1. && uBackgroundEffect > 0.) {
      float off = smoothstep(.1, .2, color.a) * length(vUv - .5) * .1;
      
      vec4 ic0 = getImage(vUv, true);
      if (uBackgroundEffect == 1.) {
        // Displacement

        vec4 ic = getImage(vUv + off + edge * .01, true);
        color = mix(ic0, ic, color.a);
      }
      else if (uBackgroundEffect == 2.) {
        // Blur
        float dirs = 16.0; // blur directions
        float qual = 4.0; // blur quality
        float size = 8.0; // blur size
        vec2 radius = size/uResolution;
        
        vec4 cblur = getImage(vUv + off, true);		
        
        for (float j = 0.; j < PI; j += PI/dirs) {
          for (float i = 1./qual; i <= 1.001; i += 1./qual)  {		
            cblur += getImage(vUv + i * vec2(cos(j), sin(j)) * radius + off, true);		
          }
        }
        cblur /= qual * dirs + 1.;

        color = mix(ic0, cblur, color.a);
      }      
    }

    if (uTextEnabled == 1.) {
      vec4 text = texture(uText, vUv);
      vec4 ic0 = getImage(vUv, true);
      float texta = color.a * mix(uBlendText, 0., (uInputBackground == 1. && uBackgroundEffect > 0.) ? 1.: 0.);
      vec3 textColor = mix(uColorText, mix(uColorText, uColor, .4), texta);
      color.rgb = mix(mix(color.rgb, ic0.rgb, 1.-color.a), textColor, text.a);
      color.a = max(color.a, text.a);
    }

    if (uCapture == 1.) color.a *= 0.;

    gl_FragColor = color;
    
    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default fragmentShader;
