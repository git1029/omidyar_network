const getImage = /* glsl */ `
  vec2 getImageUv(vec2 uv) {
    float inputAspect = uMode == 0. ? uInputAspect.x : uMode == 1. ? uInputAspect.y : uMode == 2. ? uInputAspect.z : 1.;
    vec2 imgUv = uv;

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

    return imgUv;
  }

  vec4 getImage(vec2 uv, bool gamma) {
    vec2 imgUv = getImageUv(uv);
    vec4 color = vec4(0.);
    if (uCapture == 1. || uMode == 2.) color = texture(uCamera, imgUv);
    else if (uMode == 0.) color = texture(uImage, imgUv);
    else if (uMode == 1.) {
      if (uExporting == 1.) color = texture(uExport, imgUv);
      else color = texture(uVideo, imgUv);
    }

    if (gamma) color.rgb = pow(color.rgb, vec3(2.2));

    return color;
  }
`;

export default getImage;
