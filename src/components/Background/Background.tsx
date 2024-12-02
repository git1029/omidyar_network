import { useEffect, useMemo, useRef } from "react";
import { Color, ShaderMaterial, Uniform, Vector3 } from "three";
import useStore from "../../store/store";
import { useThree } from "@react-three/fiber";
import vertexShader from "./shaders/vertexShader";
import fragmentShader from "./shaders/fragmentShader";

const Background = () => {
  const background = useRef<ShaderMaterial>(null);

  const backgroundColor = useStore((state) => state.backgroundColor);
  const setValue = useStore((state) => state.setValue);

  const { viewport } = useThree();

  useEffect(() => {
    if (background.current) {
      setValue("backgroundRef", background.current);
    }
  }, [background, setValue]);

  const backgroundUniforms = useMemo(() => {
    return {
      uImage: new Uniform(null),
      uVideo: new Uniform(null),
      uExport: new Uniform(null),
      uExporting: new Uniform(0),
      uMode: new Uniform(0),
      uCamera: new Uniform(null),
      uCapture: new Uniform(0),
      uColor: new Uniform(new Color(0xffffff)),
      uInputBackground: new Uniform(0),
      uViewport: new Uniform(new Vector3(1, 1, 1)),
      uInputAspect: new Uniform(new Vector3(1, 1, 1)),
      uAlpha: new Uniform(1),
    };
  }, []);

  useEffect(() => {
    if (background.current) {
      background.current.uniforms.uColor.value.set(backgroundColor.hex);
      background.current.uniforms.uAlpha.value =
        backgroundColor.label === "Transparent" ? 0 : 1;
    }
  }, [backgroundColor]);

  useEffect(() => {
    if (background.current) {
      background.current.uniforms.uViewport.value.set(
        viewport.width,
        viewport.height,
        viewport.aspect
      );
    }
  }, [viewport]);

  return (
    <>
      <mesh>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={background}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={backgroundUniforms}
          transparent={true}
        />
      </mesh>
    </>
  );
};

export default Background;
