import { useFrame, useThree } from "@react-three/fiber";
import vertexShader from "./shaders/vertex";
import fragmentShader from "./shaders/fragment3";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  // LinearFilter,
  Mesh,
  // NearestFilter,
  // RepeatWrapping,
  ShaderMaterial,
  Uniform,
  Vector2,
} from "three";
import { palette, gridSettings, patternSettings } from "../../store/options";
import useStore from "../../store/store";
import { useTexture, useVideoTexture } from "@react-three/drei";

const PatternGL = () => {
  const { viewport } = useThree();

  const ref = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);

  // const backgroundColor = useStore((state) => state.backgroundColor);
  // const nodeColor = useStore((state) => state.nodeColor);
  // const grid = useStore((state) => state.grid);
  const setPatternRef = useStore((state) => state.setPatternRef);

  const img = useTexture("/img.jpg");
  const video = useVideoTexture("/footage.mp4");

  const uniforms = useMemo(() => {
    return {
      uTime: new Uniform(0),
      uMode: new Uniform(0),
      PI: new Uniform(Math.PI),
      uBackgroundColor: new Uniform(new Color(palette[0].hex)),
      uForegroundColor: new Uniform(new Color(palette[1].hex)),
      uAlpha: new Uniform(1),
      uImage: new Uniform(null),
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
    if (ref.current && img) {
      const material = ref.current.material as ShaderMaterial;
      // img.minFilter = LinearFilter;
      // img.magFilter = LinearFilter;
      // img.anisotropy = 8;
      img.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      // img.wrapS = RepeatWrapping;
      // img.wrapT = RepeatWrapping;
      // img.flipY = true;
      img.needsUpdate = true;
      material.uniforms.uImage.value = img;
    }
  }, [img]);

  useEffect(() => {
    if (matRef.current) {
      setPatternRef(matRef.current);
      // const material = ref.current.material as ShaderMaterial;
      // material.uniforms.uDotSize.value = patternDotSize;
    }
  }, [matRef, setPatternRef]);

  useEffect(() => {
    if (matRef.current && video) {
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
    }
  });

  return (
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
  );
};

export default PatternGL;
