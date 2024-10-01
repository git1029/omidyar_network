import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  // DoubleSide,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Uniform,
  Vector2,
} from "three";
import useStore from "../../store/store";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  // Instance,
  // Instances,
  // PerspectiveCamera,
  useFBO,
} from "@react-three/drei";
import PatternGL from "../PatternGL/PatternGL";
import vertexShader from "./shaders/vertexShader";
import fragmentShader from "./shaders/fragmentShader";
import TextLayer from "../Text/TextLayer";
// import PatternSVG from "../PatternSVG/PatternSVG3b";

const Pattern = () => {
  const effect = useRef<ShaderMaterial>(null);

  const backgroundColor = useStore((state) => state.backgroundColor);
  const foregroundColor = useStore((state) => state.foregroundColor);
  const { mode, color } = useStore((state) => state.text);
  const setValue = useStore((state) => state.setValue);

  const { size } = useThree();
  const scene = useMemo(() => new Scene(), []);
  const scene2 = useMemo(() => new Scene(), []);
  const target = useFBO(size.width, size.height, {
    depthBuffer: false,
    format: RGBAFormat,
    // samples: 2,
  });

  const target2 = useFBO(size.width, size.height, {
    depthBuffer: false,
    format: RGBAFormat,
    // samples: 2,
  });

  useEffect(() => {
    if (effect.current) {
      setValue("effectRef", effect.current);
    }
  }, [effect, setValue]);

  // useEffect(() => {
  //   if (mode.value === 1) {
  //     gl.setRenderTarget(target2);
  //     gl.render(scene2, camera);
  //   }
  // }, [gl, camera, scene2, target2, mode]);

  useFrame(({ gl, camera }, delta) => {
    if (effect.current) {
      effect.current.uniforms.uTime.value += delta;
    }

    gl.setRenderTarget(target);
    gl.render(scene, camera);
    if (mode.value > 0) {
      gl.setRenderTarget(target2);
      gl.render(scene2, camera);
    }
    gl.setRenderTarget(null);
  });

  const effectUniforms = useMemo(() => {
    return {
      uTex: new Uniform(null),
      uTex2: new Uniform(null),
      uColor: new Uniform(new Color(0xffffff)),
      uColorText: new Uniform(new Color(0xffffff)),
      uBlendText: new Uniform(0),
      uText: new Uniform(0),
      uCapture: new Uniform(0),
      uColorBG: new Uniform(new Color(0xffffff)),
      uEffect: new Uniform(new Vector2(0, 0)),
      uTime: new Uniform(0),
      PI: new Uniform(Math.PI),
    };
  }, []);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uColorText.value.set(color.hex);
    }
  }, [color]);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uText.value = mode.value > 0 ? 1 : 0;
    }
  }, [mode]);

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
      effect.current.uniforms.uTex.value = target.texture;
    }
  }, [target]);

  useEffect(() => {
    if (effect.current) {
      effect.current.uniforms.uTex2.value = target2.texture;
    }
  }, [target2]);

  return (
    <>
      {/* <PerspectiveCamera
        near={0.01}
        far={5}
        aspect={size.width / size.height}
        manual
        makeDefault
        fov={50}
        position={[0, 0, 1]}
      /> */}

      {createPortal(<PatternGL />, scene)}
      {createPortal(<TextLayer />, scene2)}
      {/* {createPortal(<PatternSVG />, scene)} */}

      {/* <Instances
        range={5}
      > */}
      <mesh>
        <planeGeometry args={[1, 1]} />
        {/* <meshBasicMaterial
          map={target.texture}
          toneMapped={false}
          transparent={true}
        /> */}
        <shaderMaterial
          ref={effect}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={effectUniforms}
          transparent={true}
          depthTest={false}
          // opacity={0.4}
          // depthWrite={false}
          // side={DoubleSide}
        />
        {/* <Instance />
        <Instance />
        <Instance />
        <Instance />
        <Instance />
        <Instance />
        <Instance /> */}
      </mesh>
      {/* </Instances> */}
    </>
  );
};

export default Pattern;
