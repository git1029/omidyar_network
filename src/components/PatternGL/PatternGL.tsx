import { useThree } from "@react-three/fiber";
import vertexShader from "./shaders/vertex";
// import fragmentShader from "./shaders/fragment3";
// import fragmentShaderIso from "./shaders/fragment3iso";
import fragmentShader4 from "./shaders/fragment4";
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
  // RGBAFormat,
  // Scene,
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
  VideoTexture,
} from "three";
import { palette, gridSettings, patternSettings } from "../../store/options";
import useStore from "../../store/store";
import {
  // Instance,
  // Instances,
  // OrthographicCamera,
  // useFBO,
  useTexture,
  // useVideoTexture,
} from "@react-three/drei";

const PatternGL = () => {
  const { viewport } = useThree();

  const ref = useRef<Mesh>(null);
  // const test = useRef<MeshBasicMaterial>(null);
  const matRef = useRef<ShaderMaterial>(null);

  // const backgroundColor = useStore((state) => state.backgroundColor);
  // const nodeColor = useStore((state) => state.nodeColor);
  const grid = useStore((state) => state.grid);
  const backgroundRef = useStore((state) => state.backgroundRef);
  const videoRef = useStore((state) => state.videoRef);
  const setValue = useStore((state) => state.setValue);
  // const exportSettings = useStore((state) => state.exportSettings);

  const img = useTexture("/img.jpg");
  // const video = useVideoTexture("/footage.mp4");
  // const imgtest = useTexture("/color2.png");

  const video = useMemo(() => {
    if (!videoRef) return;
    const texture = new VideoTexture(videoRef);
    texture.generateMipmaps = false;
    // texture.update();

    // console.log(texture);
    const duration = texture.image.duration;
    if (!isNaN(duration) && duration > 0) {
      setValue("videoDuration", duration);
    }

    videoRef.play();

    return texture;
  }, [videoRef, setValue]);
  // setValue("videoUpload", upload);

  //   if (videoRef.current) {
  //     const texture = new VideoTexture(videoRef.current);
  //     videoRef.current.src = upload.url;
  //     videoRef.current.play();
  //     console.log(texture);
  //     texture.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
  //     // texture.needsUpdate = true;
  //     texture.update();

  //     setInitial({ ...initial, video: false });

  //     if (patternRef) {
  //       if (patternRef.uniforms.uVideo.value) {
  //         patternRef.uniforms.uVideo.value.dispose();
  //       }
  //       patternRef.uniforms.uVideo.value = texture;
  //     }

  //     if (backgroundRef) {
  //       if (backgroundRef.uniforms.uVideo.value) {
  //         backgroundRef.uniforms.uVideo.value.dispose();
  //       }
  //       backgroundRef.uniforms.uVideo.value = texture;
  //     }

  //     // Video width/height available once metadata has loaded
  //     (texture.image as HTMLVideoElement).addEventListener(
  //       "loadedmetadata",
  //       () => {
  //         const { videoWidth, videoHeight, duration } = texture.image;

  //         if (videoWidth > 0 && videoHeight > 0) {
  //           const aspect = videoWidth / videoHeight;
  //           if (patternRef) patternRef.uniforms.uInputAspect.value.y = aspect;
  //           if (backgroundRef)
  //             backgroundRef.uniforms.uInputAspect.value.y = aspect;
  //         } else {
  //           console.warn(
  //             "Unable to access video width and height or have zero value"
  //           );
  //         }

  //         if (!isNaN(duration) && duration > 0) {
  //           setValue("videoDuration", duration);
  //         } else {
  //           console.warn("Unable to access video duration or has zero value");
  //         }
  //       }
  //     );
  //   }
  // }

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
      uExport: new Uniform(null),
      uExporting: new Uniform(0),
      uVideo: new Uniform(null),
      uCamera: new Uniform(null),
      uText: new Uniform(null),
      uLogo: new Uniform(0),
      // uData: new Uniform(null),
      uDPR: new Uniform(Math.min(window.devicePixelRatio, 2)),
      uGrid: new Uniform(gridSettings.gridType),
      uConnectors: new Uniform(
        new Vector2().set(
          gridSettings.gridConnectors[0] === true ? 1 : 0,
          gridSettings.gridConnectors[1] === true ? 1 : 0
        )
      ),
      // uEffect: new Uniform(new Vector2(0, 0)),
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
      // uInputBackground: new Uniform(0),
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
    if (img) {
      // img.minFilter = LinearFilter;
      // img.magFilter = LinearFilter;
      // img.anisotropy = 8;
      // console.log(img.image.width, img.image.height);
      img.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      img.wrapS = MirroredRepeatWrapping;
      img.wrapT = MirroredRepeatWrapping;
      // img.flipY = false;
      img.needsUpdate = true;

      const { width, height } = img.image;
      const aspect = width > 0 && height > 0 ? width / height : 1;
      if (matRef.current) {
        matRef.current.uniforms.uImage.value = img;
        matRef.current.uniforms.uInputAspect.value.x = aspect;
      }
      if (backgroundRef) {
        backgroundRef.uniforms.uImage.value = img;
        backgroundRef.uniforms.uInputAspect.value.x = aspect;
      }
    }
  }, [img, backgroundRef]);

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

  // useEffect(() => {
  //   if (matRef.current) {
  //     matRef.current.uniforms.uExporting.value = exportSettings.exporting
  //       ? 1
  //       : 0;
  //     // const material = ref.current.material as ShaderMaterial;
  //     // material.uniforms.uDotSize.value = patternDotSize;
  //   }
  // }, [matRef, exportSettings]);

  useEffect(() => {
    if (video) {
      // video.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      // // imgtest.wrapS = RepeatWrapping;
      // // imgtest.wrapT = RepeatWrapping;
      // // imgtest.flipY = false;
      // video.needsUpdate = true;

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
      const { videoWidth, videoHeight } = video.image;
      const aspect =
        videoWidth > 0 && videoHeight > 0 ? videoWidth / videoHeight : 1;

      if (matRef.current) {
        matRef.current.uniforms.uVideo.value = video;
        matRef.current.uniforms.uInputAspect.value.y = aspect;
      }

      if (backgroundRef) {
        backgroundRef.uniforms.uVideo.value = video;
        backgroundRef.uniforms.uInputAspect.value.y = aspect;
      }
    }
  }, [video, backgroundRef]);

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

  useEffect(() => {
    if (matRef.current) {
      matRef.current.fragmentShader = fragmentShader4(grid.value);
      // grid.value === 0 ? fragmentShader : fragmentShaderIso;
      matRef.current.needsUpdate = true;
      // console.log(grid, matRef.current);
    }
  }, [grid, matRef]);

  // useFrame((_state, delta) => {
  //   if (matRef.current) {
  //     matRef.current.uniforms.uTime.value += delta;
  //     // video.image.pause();
  //     // video.source.data.currentTime =
  //     //   _state.clock.elapsedTime % video.source.data.duration;
  //     // video.needsUpdate = true;
  //   }
  // });

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
          fragmentShader={fragmentShader4(0)}
          uniforms={uniforms}
          transparent={true}
          ref={matRef}
          // onUpdate={(s) => console.log("UPDATE", s)}
          // onBeforeCompile={(s) => console.log(s)}
        />
      </mesh>
    </>
  );
};

export default PatternGL;
