import { useFrame, useThree } from "@react-three/fiber";
import vertexShader from "./shaders/vertex";
import fragmentShader from "./shaders/fragment7";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  // LinearSRGBColorSpace,
  // LinearFilter,
  // LinearFilter,
  Mesh,
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
} from "three";
import { palette, gridSettings, patternSettings } from "../../store/options";
import useStore from "../../store/store";
import { useTexture, useVideoTexture } from "@react-three/drei";

const PatternGL = () => {
  const { viewport } = useThree();

  const ref = useRef<Mesh>(null);
  // const test = useRef<MeshBasicMaterial>(null);
  const matRef = useRef<ShaderMaterial>(null);

  // const backgroundColor = useStore((state) => state.backgroundColor);
  // const nodeColor = useStore((state) => state.nodeColor);
  // const grid = useStore((state) => state.grid);
  const setPatternRef = useStore((state) => state.setPatternRef);

  const img = useTexture("/img.jpg");
  const video = useVideoTexture("/footage.mp4");
  const imgtest = useTexture("/color2.png");

  const uniforms = useMemo(() => {
    return {
      uTime: new Uniform(0),
      uMode: new Uniform(0),
      PI: new Uniform(Math.PI),
      uBackgroundColor: new Uniform(new Color(palette[0].hex)),
      uForegroundColor: new Uniform(new Color(palette[1].hex)),
      uAlpha: new Uniform(1),
      uImage: new Uniform(null),
      uColor: new Uniform(null),
      uVideo: new Uniform(null),
      uCamera: new Uniform(null),
      uText: new Uniform(null),
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
      uDensity: new Uniform(
        new Vector2(
          patternSettings.patternDensityX,
          patternSettings.patternDensityY
        )
      ),
      uInvert: new Uniform(0),
      uViewport: new Uniform(new Vector2(1, 1)),
    };
  }, []);

  useEffect(() => {
    // console.log(img);
    if (ref.current && img) {
      const material = ref.current.material as ShaderMaterial;
      // img.minFilter = LinearFilter;
      // img.magFilter = LinearFilter;
      // img.anisotropy = 8;
      img.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      // img.wrapS = RepeatWrapping;
      // img.wrapT = RepeatWrapping;
      // img.flipY = false;
      img.needsUpdate = true;
      material.uniforms.uImage.value = img;
    }
  }, [img]);

  useEffect(() => {
    // console.log(img);
    if (ref.current && imgtest) {
      const material = ref.current.material as ShaderMaterial;
      // imgtest.minFilter = LinearFilter;
      // imgtest.magFilter = LinearFilter;
      // imgtest.colorSpace = LinearSRGBColorSpace;
      // imgtest.anisotropy = 8;
      imgtest.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      // imgtest.wrapS = RepeatWrapping;
      // imgtest.wrapT = RepeatWrapping;
      // imgtest.flipY = false;
      imgtest.needsUpdate = true;
      material.uniforms.uColor.value = imgtest;
    }
  }, [imgtest]);

  useEffect(() => {
    if (matRef.current) {
      setPatternRef(matRef.current);
      // const material = ref.current.material as ShaderMaterial;
      // material.uniforms.uDotSize.value = patternDotSize;
    }
  }, [matRef, setPatternRef]);

  useEffect(() => {
    if (matRef.current && video) {
      console.log(video);
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
    }
  }, [video]);

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uViewport.value.set(
        viewport.width,
        viewport.height
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
      {/* <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, 0.1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={test} color={0xff0000} map={null} />
      </mesh> */}
      <mesh scale={[viewport.width, viewport.height, 1]} ref={ref}>
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

export default PatternGL;
