const fragmentShader = /*glsl*/ `
  uniform sampler2D uImage;
  uniform float uCapture;
  uniform sampler2D uVideo;
  uniform sampler2D uCamera;
  uniform vec3 uColor;
  uniform float uInputBackground;
  uniform vec3 uViewport;
  uniform vec3 uInputAspect;
  uniform float uAlpha;
  uniform float uMode;
  varying vec2 vUv;

  void main() {
    // vec4 color = vec4(0.);
    vec3 backgroundColor = uColor;

    if ((uInputBackground == 1. && uMode < 3.) || uCapture == 1.) {
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
  
      if (uCapture == 1. || uMode == 2.) backgroundColor = texture(uCamera, imgUv).rgb;
      else if (uMode == 0.) backgroundColor = texture(uImage, imgUv).rgb;
      else if (uMode == 1.) backgroundColor = texture(uVideo, imgUv).rgb;

      // backgroundColor = sRGBTransferOETF(vec4(backgroundColor, 1.)).rgb;
      backgroundColor = pow(backgroundColor, vec3(2.2));
    }
    
    gl_FragColor = vec4(backgroundColor, uAlpha);
    // gl_FragColor = texture(uCapture, vUv);
    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default fragmentShader;
