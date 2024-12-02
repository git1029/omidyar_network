import { useEffect, useMemo, useRef } from "react";
import { Color, ShaderMaterial, Uniform, Vector2, Vector3 } from "three";
import useStore from "../../store/store";
import vertexShader from "./shaders/vertexShader";
import fragmentShader from "./shaders/fragmentShader";
import { useThree } from "@react-three/fiber";

const Pattern = () => {
  const effect = useRef<ShaderMaterial>(null);

  const backgroundColor = useStore((state) => state.backgroundColor);
  const foregroundColor = useStore((state) => state.foregroundColor);
  const { animating } = useStore((state) => state.patternEffect);
  const { mode: textMode, color } = useStore((state) => state.text);
  const setValue = useStore((state) => state.setValue);

  const { viewport, size } = useThree();

  useEffect(() => {
    if (effect.current) {
      setValue("effectRef", effect.current);
    }
  }, [effect, setValue]);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uViewport.value.set(
        viewport.width,
        viewport.height,
        viewport.aspect
      );
    }
  }, [viewport]);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size]);

  const effectUniforms = useMemo(() => {
    return {
      uPattern: new Uniform(null),
      uText: new Uniform(null),
      uColor: new Uniform(new Color(0xffffff)),
      uColorText: new Uniform(new Color(0xffffff)),
      uBlendText: new Uniform(0),
      uTextEnabled: new Uniform(0),
      uCapture: new Uniform(0),
      uColorBG: new Uniform(new Color(0xffffff)),
      uEffect: new Uniform(new Vector3(0, 0, 1)),
      uTime: new Uniform(0),
      PI: new Uniform(Math.PI),
      uMode: new Uniform(0),
      uImage: new Uniform(null),
      uVideo: new Uniform(null),
      uExport: new Uniform(null),
      uExporting: new Uniform(0),
      uViewport: new Uniform(new Vector3(1, 1, 1)),
      uResolution: new Uniform(new Vector2(1, 1)),
      uInputAspect: new Uniform(new Vector3(1, 1, 1)),
      uInputBackground: new Uniform(0),
      uBackgroundEffect: new Uniform(0),
    };
  }, []);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uColorText.value.set(color.hex);
    }
  }, [color]);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uTextEnabled.value = textMode.value > 0 ? 1 : 0;
    }
  }, [textMode]);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uColor.value.set(foregroundColor.hex);
    }
  }, [foregroundColor]);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uColorBG.value.set(backgroundColor.hex);
    }
  }, [backgroundColor]);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uEffect.value.z = animating ? 1 : 0;
    }
  }, [animating]);

  return (
    <>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={effect}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={effectUniforms}
          transparent={true}
          depthTest={false}
        />
      </mesh>
    </>
  );
};

export default Pattern;
