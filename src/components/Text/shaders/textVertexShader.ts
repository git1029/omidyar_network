const textVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBase;
  uniform float uId;
  uniform float uLogo;
  uniform float uLayout;
  uniform float uMode;
  uniform vec2 uCaption;
  uniform vec3 uViewport;
  uniform float uSpeed;
  uniform float uScale;
  uniform vec4 uBounds;
  uniform float uAnimating;

  varying float vT;
  varying vec3 vP;
  varying vec2 vUv;
  varying vec2 vA;

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  float linearstep(float edge0, float edge1, float x) {
    // Scale, and clamp x to 0..1 range
    x = clamp(0., 1., (x - edge0) / (edge1 - edge0));
    return x;
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
  float cubicIn(float t) {
    return t * t * t;
  }


  struct Data {
    vec2 pos;
    vec2 scl;
    vec2 size;
    vec2 textSize;
  };

  // Returns position and scale for text at grid x,y position
  Data getPos (vec2 id) {
    // float scale = mix(1., map(step(.5, uScale), 0., 1., 1., 2.), uAnimating);
    // scale = 1.;

    float grid = 4.;

    float marginFactor = 1. / 34.;

    float marginX = marginFactor;
    float marginY = marginFactor * uViewport.z;
    vec2 margin = vec2(marginX, marginY);

    vec2 gap = margin * 0.5;

    float w = uBounds.z - uBounds.x;
    float h = uBounds.w - uBounds.y;

    if (uCaption.y == 1.) {
      float height = margin.y * 0.75;
      float scl = height / h;
      float sclX = scl / uViewport.z;
      float sclY = scl;
      float posX = -0.5 + margin.x;
      float posY = -0.5 + h * sclY + margin.y;
      return Data(vec2(posX, posY), vec2(sclX, sclY), vec2(1.), vec2(1.));
    }

    // Add margin if logo and/or caption to calculate correct row height
    float marginY2 = 0.;
    // if (uLogo == 1.) marginY2 += marginY;
    if (uCaption.x == 1.) marginY2 += marginY;

    // Add margin if logo to calculate correct y position
    float marginY3 = 0.;

    float cWidth = (1.- margin.x * 2. - (grid - 1.) * gap.x) / grid;
    float rHeight = (1. - margin.y * 2. - (grid - 1.) * gap.y - marginY2) / grid;

    float posX = cWidth * id.x + id.x * gap.x - 0.5 + margin.x;
    float posY = 0.5 - (rHeight * id.y + id.y * gap.y + margin.y + marginY3);

    float cSpan = 2.;
    float rSpan = 1.;
    
    float width = cWidth * cSpan + max(0., cSpan - 1.) * gap.x;
    float height = rHeight * rSpan + max(0., rSpan - 1.) * gap.y;

    // float limit = 1.5;

    // float scl = uViewport.z > limit ? height / h : width / w;

    float scl2 = min((width / w), (height / h) / uViewport.z);

    // float sclX = uViewport.z > limit ? scl2 / uViewport.z : scl2;
    // float sclY = uViewport.z > limit ? scl2 : scl2 * uViewport.z;

    float sclX = scl2;
    float sclY = scl2 * uViewport.z;


    return Data(vec2(posX, posY), vec2(sclX, sclY), vec2(cWidth, rHeight), vec2(w, h));
  }
 
  void main() {
    float speed = map(uSpeed, 0., 1., 0.5, 2.);

    vec2 xy = vec2(0.);

    if (uLayout == 0.) xy = vec2(0., 3.);
    else if (uLayout == 1.) {
      if (uId == 1.) xy = vec2(1., 1.);
      else if (uId == 2.) xy = vec2(0., 2.);
      else if (uId == 3.) xy = vec2(2., 3.);
    }
    // else if (uLayout == 2.) xy = vec2(2., 0.);
    else if (uLayout == 2.) xy = vec2(2., 1.);

    if (uCaption.y == 0. && uMode == 2.) {
      if (uLayout == 0.) {
        if (uId == 0.) xy = vec2(0., 0.);
        if (uId == 1.) xy = vec2(2., 0.);
        if (uId == 2.) xy = vec2(0., 1.);
        if (uId == 3.) xy = vec2(2., 1.);
        if (uId == 4.) xy = vec2(0., 2.);
        if (uId == 5.) xy = vec2(2., 2.);
        if (uId == 6.) xy = vec2(0., 3.);
        if (uId == 7.) xy = vec2(2., 3.);
      }

      if (uLayout == 1.) {
        if (uId == 0.) xy = vec2(0., 0.);
        if (uId == 1.) xy = vec2(1., 1.);
        if (uId == 2.) xy = vec2(0., 2.);
        if (uId == 3.) xy = vec2(2., 3.);
        if (uId == 4.) xy = vec2(0., 0.);
        if (uId == 5.) xy = vec2(1., 1.);
        if (uId == 6.) xy = vec2(0., 2.);
        if (uId == 7.) xy = vec2(2., 3.);
        if (uId == 8.) xy = vec2(0., 0.);
        if (uId == 9.) xy = vec2(1., 1.);
        if (uId == 10.) xy = vec2(0., 2.);
        if (uId == 11.) xy = vec2(2., 3.);
      }

      if (uLayout == 2.) {
        if (uId == 0.) xy = vec2(0., 0.);
        if (uId == 1.) xy = vec2(2., 1.);
        if (uId == 2.) xy = vec2(1., 2.);
        if (uId == 3.) xy = vec2(0., 3.);
        if (uId == 4.) xy = vec2(0., 0.);
        if (uId == 5.) xy = vec2(2., 1.);
        if (uId == 6.) xy = vec2(1., 2.);
        if (uId == 7.) xy = vec2(0., 3.);
      }
    }

    vec3 pos = position;
    Data g = getPos(xy);

    vec2 a = vec2(0.);

    vec2 offset = vec2(0.);

    if (uCaption.y == 0. && uMode == 2.) {
      if (uLayout == 0.) {
        g.pos.y = 0.;

        float steps = 5.;
        float ld = 1.5 / speed;
        float off = (1.-xy.x) * .0 + (1.-xy.y)*.0;
        off = (xy.y) * 1.6 + (xy.x) * .25;
        off *= (ld/1.5);

        float offm = (3. * 1.6 + (2.) * .25) * ld/1.5;
        
        float dmax = (offm + steps * ld);
        float time = mod(uTime, nearestHalfUp(dmax));

        float tmax = time / dmax;
        
        float ts = off;
        float te = ts + ld;

        float t = 0.;
        if (time < ts) t = 0.;
        else if (time < te) t = map(time, ts, te, 0., 1.);
        else t = 1.;

        float t2 = 0.;
        if (time < ts) t2 = 0.;
        else if (time < ts + ld * steps) t2 = map(time, ts, ts + ld * steps, 0., 1.);
        else t2 = 1.;

        t = mod(t2 * steps, 1.);
        t = pow(quarticInOut(t), 2.);

        float s = floor((t2) * steps);
        float startY = g.pos.y;
        float endY = g.pos.y;

        if (s == 0.) endY = getPos(vec2(xy.x, 3.)).pos.y;
        if (s == 1.) endY = getPos(vec2(xy.x, 2.)).pos.y;
        if (s == 2.) endY = getPos(vec2(xy.x, 1.)).pos.y;
        if (s == 3.) endY = getPos(vec2(xy.x, 0.)).pos.y;
        if (s == 4.) endY = .5 + g.scl.y * g.textSize.y;
        if (s > 4.) endY = .5 + g.scl.y * g.textSize.y;

        if (s == 0.) startY = -.5;
        if (s == 1.) startY = getPos(vec2(xy.x, 3.)).pos.y;
        if (s == 2.) startY = getPos(vec2(xy.x, 2.)).pos.y;
        if (s == 3.) startY = getPos(vec2(xy.x, 1.)).pos.y;
        if (s == 4.) startY = getPos(vec2(xy.x, 0.)).pos.y;
        if (s > 4.) startY = .5 + g.scl.y * g.textSize.y;

        float offy = mix(startY, endY, t);

        offset.y += offy;
      }

      if (uLayout == 1.) {
    
        float steps = 7.;
        float ld = 1.5 / speed;
        float off = (1.-xy.x) * .0 + (1.-xy.y)*.0;
        off = (xy.y) * .25;
        off *= (ld/1.5);


        float offm = (3. * .25) * ld/1.5;

        // max duration for complete animation
        float dmax = (offm + steps * ld);
        float time = mod(uTime, nearestHalfUp(dmax));

        float tmax = time / dmax;
        
        float ts = off;
        float te = ts + ld;

        float t2 = 0.;
        if (time < ts) t2 = 0.;
        else if (time < ts + ld * steps) t2 = map(time, ts, ts + ld * steps, 0., 1.);
        else t2 = 1.;

        float t = mod(t2 * steps, 1.);
        t = pow(quarticInOut(t), 1.);

        float s = floor((t2) * steps);
        float startX = g.pos.x;
        float endX = g.pos.x;

        float w = g.textSize.x * g.scl.x;

        if (s == 0.) startX = -w;
        if (s == 0.) endX = 0.;

        if (s == 1.) startX = 0.;
        if (s == 1.) endX = 0.;

        if (s == 2.) startX = 0.;
        if (s == 2.) endX = getPos(vec2(xy.x + 1., xy.y)).pos.x - g.pos.x;

        if (s == 3.) startX = getPos(vec2(xy.x + 1., xy.y)).pos.x - g.pos.x;
        if (s == 3.) endX = getPos(vec2(xy.x + 1., xy.y)).pos.x - g.pos.x;

        if (s == 4.) startX = getPos(vec2(xy.x + 1., xy.y)).pos.x - g.pos.x;
        if (s == 4.) endX = getPos(vec2(xy.x + 2., xy.y)).pos.x - g.pos.x;

        if (s == 5.) startX = getPos(vec2(xy.x + 2., xy.y)).pos.x - g.pos.x;
        if (s == 5.) endX = getPos(vec2(xy.x + 2., xy.y)).pos.x - g.pos.x;

        if (s == 6.) startX = getPos(vec2(xy.x + 2., xy.y)).pos.x - g.pos.x;
        if (s == 6.) endX = getPos(vec2(xy.x + 3., xy.y)).pos.x - g.pos.x;

        float offx = mix(startX, endX, t);

        offset.x = offx;
        offset.x -= 1.;
        if (uId > 3.) offset.x -= 1.;
        if (uId > 7.) offset.x -= 1.;
        offset.x += tmax * 2.75;


        if (s == 0.) a.x =  1.-t;
        if (s == 6.) a.x = t;
        a.y = s;
      }

      if (uLayout == 2.) {
        float steps = 4.;
        float ld = 1.5 / speed;
        float off = (1.-xy.x) * .0 + (1.-xy.y)*.0;
        off = (1.-mod(xy.y, 2.)) * 1.5;
        off *= (ld/1.5);

        float offm = 1. * 1.5 * ld/1.5;

        // max duration for complete animation
        float dmax = (offm + (steps) * ld);
        float time = mod(uTime, nearestHalfUp(dmax));

        float tmax = time / dmax;

        float delay = (ld * (steps + 1.)) / 2.;

        float ts = off;
        float te = ts + ld;

        float t = 0.;
        if (time < ts) t = 0.;
        else if (time < te) t = map(time, ts, te, 0., 1.);
        else t = 1.;

        float t2 = 0.;
        if (time < ts) t2 = 0.;
        else if (time < ts + ld * steps) t2 = map(time, ts, ts + ld * steps, 0., 1.);
        else t2 = 1.;

        t = mod(t2 * steps, 1.);
        t = pow(quarticInOut(t), 2.);

        float s = floor((t2) * steps);
        float startX = g.pos.x;
        float endX = g.pos.x;

        float w = g.textSize.x * g.scl.x;

        if (s == 0.) startX = -w;
        if (s == 1.) startX = 0.;
        if (s == 2.) startX = -w;
        if (s == 3.) startX = 0.;

        if (s == 0.) endX = 0.;
        if (s == 1.) endX = getPos(vec2(xy.x + 2., xy.y)).pos.x - g.pos.x;
        if (s == 2.) endX = 0.;
        if (s == 3.) endX = getPos(vec2(xy.x + 2., xy.y)).pos.x - g.pos.x;

        float offx = mix(startX, endX, t);
        
        tmax = linearstep(0., .8666, tmax);
        
        offset.x = offx;
        offset.y += tmax * 1.;

        if (uId < 4.) offset.y += .15 * 0.;
        else offset.y -= 1.;

        if (s == 0.) a.x = 1.-t;
        else if (s == 1.) a.x = t;
        if (s == 2.) a.x = 1.-t;
        else if (s == 3.) a.x = t;
        a.y = s;
      }
    }

    pos.xy *= g.scl;
    pos.xy += g.pos;
    pos.xy += offset;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    vUv = uv;
    vP = pos;
    vA = a;
  }
`;

export default textVertexShader;
