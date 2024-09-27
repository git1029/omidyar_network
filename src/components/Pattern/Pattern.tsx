import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Uniform,
  Vector2,
  Vector3,
} from "three";
import useStore from "../../store/store";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, useFBO } from "@react-three/drei";
import PatternGL from "../PatternGL/PatternGL";
import effectVertexShader from "./shaders/effectVertexShader";
import effectFragmentShader from "./shaders/effectFragmentShader";
import backgroundVertexShader from "./shaders/backgroundVertexShader";
import backgroundFragmentShader from "./shaders/backgroundFragmentShader";

const Pattern = () => {
  const effect = useRef<ShaderMaterial>(null);
  const display = useRef<ShaderMaterial>(null);

  const backgroundColor = useStore((state) => state.backgroundColor);
  const foregroundColor = useStore((state) => state.foregroundColor);
  const setValue = useStore((state) => state.setValue);

  const { size, viewport } = useThree();
  const scene = useMemo(() => new Scene(), []);
  const target = useFBO(size.width, size.height, {
    depthBuffer: false,
    format: RGBAFormat,
    // samples: 2,
  });

  useEffect(() => {
    if (effect.current) {
      setValue("effectRef", effect.current);
    }
  }, [effect, setValue]);

  useEffect(() => {
    if (display.current) {
      setValue("displayRef", display.current);
    }
  }, [display, setValue]);

  useFrame(({ gl, camera }, delta) => {
    if (effect.current) {
      effect.current.uniforms.uTime.value += delta;
    }

    gl.setRenderTarget(target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  const [effectUniforms, backgroundUniforms] = useMemo(() => {
    const effectUniforms = {
      uTex: new Uniform(null),
      uColor: new Uniform(new Color(0xffffff)),
      uEffect: new Uniform(new Vector2(0, 0)),
      uTime: new Uniform(0),
    };

    const backgroundUniforms = {
      uImage: new Uniform(null),
      uVideo: new Uniform(null),
      uMode: new Uniform(0),
      uCamera: new Uniform(null),
      uColor: new Uniform(new Color(0xffffff)),
      uInputBackground: new Uniform(0),
      uViewport: new Uniform(new Vector3(1, 1, 1)),
      uInputAspect: new Uniform(new Vector3(1, 1, 1)),
      uAlpha: new Uniform(1),
    };

    return [effectUniforms, backgroundUniforms];
  }, []);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uColor.value.set(foregroundColor.hex);
    }
  }, [foregroundColor]);

  useEffect(() => {
    if (display.current) {
      display.current.uniforms.uColor.value.set(backgroundColor.hex);
      display.current.uniforms.uAlpha.value =
        backgroundColor.label === "Transparent" ? 0 : 1;
    }
  }, [backgroundColor]);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uTex.value = target.texture;
    }
  }, [target]);

  useEffect(() => {
    if (display.current) {
      display.current.uniforms.uViewport.value.set(
        viewport.width,
        viewport.height,
        viewport.aspect
      );
    }
  }, [viewport]);

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

      <mesh>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={display}
          vertexShader={backgroundVertexShader}
          fragmentShader={backgroundFragmentShader}
          uniforms={backgroundUniforms}
          transparent={true}
        />
      </mesh>

      {/* <Instances> */}
      <mesh scale={[1, 1, 1]}>
        <planeGeometry args={[1, 1]} />
        {/* <meshBasicMaterial
          map={target.texture}
          toneMapped={false}
          transparent={true}
        /> */}
        <shaderMaterial
          ref={effect}
          vertexShader={effectVertexShader}
          fragmentShader={effectFragmentShader}
          uniforms={effectUniforms}
          transparent={true}
        />
        {/* <Instance />
        <Instance />
        <Instance /> */}
      </mesh>
      {/* </Instances> */}
    </>
  );
};

export default Pattern;
