import { createPortal, useFrame, useThree } from "@react-three/fiber";
import vertexShader from "./shaders/vertex";
import fragmentShader from "./shaders/fragment";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  // DataTexture,
  // FloatType,
  // LinearSRGBColorSpace,
  // LinearFilter,
  // LinearFilter,
  Mesh,
  MirroredRepeatWrapping,
  RGBAFormat,
  Scene,
  // RepeatWrapping,
  // RGBAFormat,
  // MeshBasicMaterial,
  // RepeatWrapping,
  // RepeatWrapping,
  // NearestFilter,
  // RepeatWrapping,
  ShaderMaterial,
  // SRGBColorSpace,
  // Texture,
  Uniform,
  Vector2,
  Vector3,
} from "three";
import { palette, gridSettings, patternSettings } from "../../store/options";
import useStore from "../../store/store";
import {
  OrthographicCamera,
  useFBO,
  useTexture,
  useVideoTexture,
} from "@react-three/drei";

const PatternGL = () => {
  const { viewport } = useThree();

  const ref = useRef<Mesh>(null);
  // const test = useRef<MeshBasicMaterial>(null);
  const matRef = useRef<ShaderMaterial>(null);

  // const backgroundColor = useStore((state) => state.backgroundColor);
  // const nodeColor = useStore((state) => state.nodeColor);
  // const grid = useStore((state) => state.grid);
  const setValue = useStore((state) => state.setValue);

  const img = useTexture("/img.jpg");
  const video = useVideoTexture("/footage.mp4");
  // const imgtest = useTexture("/color2.png");

  const uniforms = useMemo(() => {
    return {
      uTime: new Uniform(0),
      uMode: new Uniform(0),
      PI: new Uniform(Math.PI),
      uBackgroundColor: new Uniform(new Color(palette[0].hex)),
      uForegroundColor: new Uniform(new Color(palette[1].hex)),
      uAlpha: new Uniform(1),
      uImage: new Uniform(null),
      // uColor: new Uniform(null),
      uVideo: new Uniform(null),
      uCamera: new Uniform(null),
      uText: new Uniform(null),
      // uData: new Uniform(null),
      uDPR: new Uniform(Math.min(window.devicePixelRatio, 2)),
      uGrid: new Uniform(gridSettings.gridType),
      uConnectors: new Uniform(
        new Vector2().set(
          gridSettings.gridConnectors[0] === true ? 1 : 0,
          gridSettings.gridConnectors[1] === true ? 1 : 0
        )
      ),
      uQuantity: new Uniform(gridSettings.gridQuantity),
      uDotSize: new Uniform(patternSettings.patternDotSize),
      uContrast: new Uniform(patternSettings.patternContrast),
      uInputContrast: new Uniform(0.5),
      uDensity: new Uniform(
        new Vector2(
          patternSettings.patternDensityX,
          patternSettings.patternDensityY
        )
      ),
      uInvert: new Uniform(0),
      uViewport: new Uniform(new Vector3(1, 1, 1)),
      // uImageSize: new Uniform(new Vector3(1, 1, 1)),
      // uVideoSize: new Uniform(new Vector3(1, 1, 1)),
      uInputAspect: new Uniform(new Vector3(1, 1, 1)),
      uInputBackground: new Uniform(0),
    };
  }, []);

  // const dataTex = useMemo(() => {
  //   const width = 64;
  //   const height = 64;

  //   const size = width * height;
  //   // const data = new Uint8Array(4 * size);
  //   const data = new Float32Array(4 * size);
  //   // const color = new Color( 0xffffff );

  //   // const r = Math.floor( color.r * 255 );
  //   // const g = Math.floor( color.g * 255 );
  //   // const b = Math.floor( color.b * 255 );

  //   // const b = Math.random()
  //   const grid = 9;

  //   for (let i = 0; i < size; i++) {
  //     // const r = Math.random();
  //     // const g = Math.random();

  //     const x = (i % grid) / grid + 0.5 / grid;
  //     const y = Math.floor(i / grid) / grid + 0.5 / grid;
  //     const stride = i * 4;
  //     data[stride] = x;
  //     data[stride + 1] = y;
  //     data[stride + 2] = 0;
  //     data[stride + 3] = 0;
  //   }

  //   // used the buffer to create a DataTexture
  //   const texture = new DataTexture(data, width, height, RGBAFormat, FloatType);
  //   texture.needsUpdate = true;

  //   return texture;
  // }, []);

  // useEffect(() => {
  //   if (matRef.current) {
  //     matRef.current.uniforms.uData.value = dataTex;
  //   }
  // }, [dataTex]);

  useEffect(() => {
    // console.log(img);
    if (matRef.current && img) {
      // img.minFilter = LinearFilter;
      // img.magFilter = LinearFilter;
      // img.anisotropy = 8;
      // console.log(img.image.width, img.image.height);
      img.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      img.wrapS = MirroredRepeatWrapping;
      img.wrapT = MirroredRepeatWrapping;
      // img.flipY = false;
      img.needsUpdate = true;
      matRef.current.uniforms.uImage.value = img;

      const { width, height } = img.image;
      matRef.current.uniforms.uInputAspect.value.x = width / height;
    }
  }, [img]);

  // useEffect(() => {
  //   // console.log(img);
  //   if (ref.current && imgtest) {
  //     const material = ref.current.material as ShaderMaterial;
  //     // imgtest.minFilter = LinearFilter;
  //     // imgtest.magFilter = LinearFilter;
  //     // imgtest.colorSpace = LinearSRGBColorSpace;
  //     // imgtest.anisotropy = 8;
  //     imgtest.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
  //     // imgtest.wrapS = RepeatWrapping;
  //     // imgtest.wrapT = RepeatWrapping;
  //     // imgtest.flipY = false;
  //     imgtest.needsUpdate = true;
  //     material.uniforms.uColor.value = imgtest;
  //   }
  // }, [imgtest]);

  useEffect(() => {
    if (matRef.current) {
      setValue("patternRef", matRef.current);
      // const material = ref.current.material as ShaderMaterial;
      // material.uniforms.uDotSize.value = patternDotSize;
    }
  }, [matRef, setValue]);

  useEffect(() => {
    if (matRef.current && video) {
      video.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      // imgtest.wrapS = RepeatWrapping;
      // imgtest.wrapT = RepeatWrapping;
      // imgtest.flipY = false;
      video.needsUpdate = true;

      // video.image.play();

      // const vf = new VideoFrame(video.image as HTMLVideoElement);
      // console.log(vf);
      // if (test.current) {
      //   test.current.map = new Texture(vf);
      //   test.current.needsUpdate = true;
      // }
      // video.image.play();
      // (video.image as HTMLVideoElement).requestVideoFrameCallback(
      //   (now, metadata) => {
      //     console.log(now, metadata);
      //   }
      // );
      // video.needsUpdate = false;
      matRef.current.uniforms.uVideo.value = video;

      const { videoWidth, videoHeight } = video.image;
      matRef.current.uniforms.uInputAspect.value.y = videoWidth / videoHeight;
    }
  }, [video]);

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uViewport.value.set(
        viewport.width,
        viewport.height,
        viewport.aspect
      );
    }
  }, [viewport]);

  // useEffect(() => {
  //   if (ref.current) {
  //     const material = ref.current.material as ShaderMaterial;
  //     material.uniforms.uBackgroundColor.value.set(backgroundColor);
  //   }
  // }, [backgroundColor]);

  // useEffect(() => {
  //   if (ref.current) {
  //     const material = ref.current.material as ShaderMaterial;
  //     material.uniforms.uNodeColor.value.set(nodeColor);
  //   }
  // }, [nodeColor]);

  // useEffect(() => {
  //   if (ref.current) {
  //     const material = ref.current.material as ShaderMaterial;
  //     material.uniforms.uGrid.value = grid;
  //   }
  // }, [grid]);

  useFrame((_state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
      // video.image.pause();
      // video.source.data.currentTime =
      //   _state.clock.elapsedTime % video.source.data.duration;
      // video.needsUpdate = true;
    }
  });

  return (
    <>
      {/* <OrthographicCamera
        near={-1}
        far={1}
        left={-0.5}
        right={0.5}
        top={0.5}
        bottom={-0.5}
        manual
        makeDefault
      /> */}
      {/* <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, 0.1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={test} color={0xff0000} map={null} />
      </mesh> */}
      <mesh scale={[1, 1, 1]} ref={ref}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          ref={matRef}
        />
      </mesh>
    </>
  );
};

const PatternScene = () => {
  const { size } = useThree();
  const scene = useMemo(() => new Scene(), []);
  const target = useFBO(size.width, size.height, {
    depthBuffer: false,
    format: RGBAFormat,
    // samples: 2,
  });

  const mat = useRef<ShaderMaterial>(null);

  const backgroundColor = useStore((state) => state.backgroundColor);
  const foregroundColor = useStore((state) => state.foregroundColor);

  useFrame(({ gl, camera }) => {
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  const uniforms = useMemo(() => {
    return {
      uTex: new Uniform(null),
      uColor: new Uniform(new Color(0xffffff)),
      uAlpha: new Uniform(0),
    };
  }, []);

  useEffect(() => {
    if (mat.current) {
      mat.current.uniforms.uAlpha.value =
        backgroundColor.label === "Transparent" ? 0 : 1;
      mat.current.uniforms.uColor.value.set(foregroundColor.hex);
    }
  }, [backgroundColor, foregroundColor]);

  useEffect(() => {
    if (mat.current) {
      mat.current.uniforms.uTex.value = target.texture;
    }
  }, [target]);

  return (
    <>
      <OrthographicCamera
        near={-1}
        far={1}
        left={-0.5}
        right={0.5}
        top={0.5}
        bottom={-0.5}
        manual
        makeDefault
      />

      {createPortal(<PatternGL />, scene)}

      <mesh scale={[1, 1, 1]}>
        <planeGeometry args={[1, 1]} />
        {/* <meshBasicMaterial
          map={target.texture}
          toneMapped={false}
          transparent={true}
        /> */}
        <shaderMaterial
          ref={mat}
          vertexShader={
            /*glsl*/ `
            varying vec2 vUv;
            void main() {
              vec4 modelPosition = modelMatrix * vec4(position, 1.0);
              vec4 viewPosition = viewMatrix * modelPosition;
              vec4 projectedPosition = projectionMatrix * viewPosition;
              gl_Position = projectedPosition;
          
              vUv = uv;
            }
            `
          }
          fragmentShader={
            /*glsl*/ `
              uniform sampler2D uTex;
              uniform vec3 uColor;
              uniform float uAlpha;
              varying vec2 vUv;
              void main() {
                vec4 c = texture(uTex, vUv);
                gl_FragColor = vec4(mix(uColor, c.rgb, uAlpha), c.a);
    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
              }
              `
          }
          uniforms={uniforms}
          // alphaTest={0.95}
          transparent={true}
        />
      </mesh>
    </>
  );
};

export default PatternScene;
