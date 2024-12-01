import { useThree } from "@react-three/fiber";
import vertexShader from "./shaders/vertex";
import fragmentShader4 from "./shaders/fragment";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  Mesh,
  MirroredRepeatWrapping,
  ShaderMaterial,
  Uniform,
  Vector2,
  Vector3,
  VideoTexture,
} from "three";
import {
  palette,
  gridSettingsDefault,
  patternSettings,
} from "../../store/options";
import useStore from "../../store/store";
import { useTexture } from "@react-three/drei";

const PatternGL = () => {
  const { viewport } = useThree();

  const ref = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);

  const grid = useStore((state) => state.grid);
  const backgroundRef = useStore((state) => state.backgroundRef);
  const effectRef = useStore((state) => state.effectRef);
  const videoRef = useStore((state) => state.videoRef);
  const setValue = useStore((state) => state.setValue);

  const img = useTexture("/img.jpg");

  const video = useMemo(() => {
    if (!videoRef) return;
    const texture = new VideoTexture(videoRef);
    texture.generateMipmaps = false;
    const duration = texture.image.duration;
    if (!isNaN(duration) && duration > 0) {
      setValue("videoDuration", duration);
    }

    videoRef.play();

    return texture;
  }, [videoRef, setValue]);

  const uniforms = useMemo(() => {
    return {
      uTime: new Uniform(0),
      uMode: new Uniform(0),
      PI: new Uniform(Math.PI),
      uBackgroundColor: new Uniform(new Color(palette[0].hex)),
      uForegroundColor: new Uniform(new Color(palette[1].hex)),
      uAlpha: new Uniform(1),
      uImage: new Uniform(null),
      uExport: new Uniform(null),
      uExporting: new Uniform(0),
      uVideo: new Uniform(null),
      uCamera: new Uniform(null),
      uText: new Uniform(null),
      uLogo: new Uniform(0),
      uDPR: new Uniform(Math.min(window.devicePixelRatio, 2)),
      uGrid: new Uniform(gridSettingsDefault.gridType),
      uConnectors: new Uniform(
        new Vector2().set(
          gridSettingsDefault.gridConnectors[0] === true ? 1 : 0,
          gridSettingsDefault.gridConnectors[1] === true ? 1 : 0
        )
      ),
      uQuantity: new Uniform(gridSettingsDefault.gridQuantity),
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
      uInputAspect: new Uniform(new Vector3(1, 1, 1)),
      uInputBackground: new Uniform(0),
      uBackgroundEffect: new Uniform(0),
    };
  }, []);

  useEffect(() => {
    if (img) {
      img.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      img.wrapS = MirroredRepeatWrapping;
      img.wrapT = MirroredRepeatWrapping;
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
      if (effectRef) {
        effectRef.uniforms.uImage.value = img;
        effectRef.uniforms.uInputAspect.value.x = aspect;
      }
    }
  }, [img, backgroundRef, effectRef]);

  useEffect(() => {
    if (matRef.current) {
      setValue("patternRef", matRef.current);
    }
  }, [matRef, setValue]);

  useEffect(() => {
    if (video) {
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

      if (effectRef) {
        effectRef.uniforms.uVideo.value = video;
        effectRef.uniforms.uInputAspect.value.y = aspect;
      }
    }
  }, [video, backgroundRef, effectRef]);

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uViewport.value.set(
        viewport.width,
        viewport.height,
        viewport.aspect
      );
    }
  }, [viewport]);

  useEffect(() => {
    if (matRef.current) {
      matRef.current.fragmentShader = fragmentShader4(grid.value);
      // grid.value === 0 ? fragmentShader : fragmentShaderIso;
      matRef.current.needsUpdate = true;
      // console.log(grid, matRef.current);
    }
  }, [grid, matRef]);

  return (
    <>
      <mesh scale={[1, 1, 1]} ref={ref}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader4(0)}
          uniforms={uniforms}
          transparent={true}
          ref={matRef}
        />
      </mesh>
    </>
  );
};

export default PatternGL;
