import getImage from "./partials/getImage";

const fragmentShader = /*glsl*/ `
  uniform sampler2D uImage;
  uniform float uCapture;
  uniform sampler2D uVideo;
  uniform sampler2D uCamera;
  uniform vec3 uColor;
  uniform float uInputBackground;
  uniform sampler2D uExport;
  uniform float uExporting;
  uniform vec3 uViewport;
  uniform vec3 uInputAspect;
  uniform float uAlpha;
  uniform float uMode;
  varying vec2 vUv;

  ${getImage}

  void main() {
    // vec4 color = vec4(0.);
    vec3 backgroundColor = uColor;

    if ((uInputBackground == 1. && uMode < 3.) || uCapture == 1.) {
      backgroundColor = getImage(vUv, true).rgb;
  
      // backgroundColor = sRGBTransferOETF(vec4(backgroundColor, 1.)).rgb;
      // backgroundColor = pow(backgroundColor, vec3(2.2));
    }
    
    gl_FragColor = vec4(backgroundColor, uAlpha);
    // gl_FragColor = texture(uCapture, vUv);
    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default fragmentShader;
