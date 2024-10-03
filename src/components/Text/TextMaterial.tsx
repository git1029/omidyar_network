import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  ShaderMaterial,
  Uniform,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import { useThree } from "@react-three/fiber";
import useStore from "../../store/store";
import textVertexShader from "./shaders/textVertexShader";
import textFragmentShader from "./shaders/textFragmentShader";

const TextMaterial = ({
  isCaption = false,
  id,
}: {
  isCaption?: boolean;
  id?: number;
}) => {
  const ref = useRef<ShaderMaterial>(null);

  const { mode, color, layout, animating, animationSpeed, animationScale } =
    useStore((state) => state.text);
  const logo = useStore((state) => state.logo);
  const caption = useStore((state) => state.caption);

  const { viewport } = useThree();

  const uniforms = useMemo(() => {
    return {
      uColor: new Uniform(new Color(0xffffff)),
      uTime: new Uniform(0),
      uLogo: new Uniform(0),
      uCaption: new Uniform(new Vector2(0, 0)),
      uLayout: new Uniform(0),
      uSpeed: new Uniform(0.5),
      uScale: new Uniform(0.5),
      uMode: new Uniform(0),
      uId: new Uniform(0),
      uAnimating: new Uniform(0),
      uViewport: new Uniform(new Vector3(1, 1, 1)),
      uBounds: new Uniform(new Vector4(0, 0, 1, 1)),
    };
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.uniforms.uColor.value.set(color.hex);
    }
  }, [color]);

  useEffect(() => {
    if (ref.current) {
      ref.current.uniforms.uMode.value = mode.value;
      if (mode.value === 2) ref.current.uniforms.uTime.value = 0;
    }
  }, [mode]);

  useEffect(() => {
    if (ref.current) {
      ref.current.uniforms.uCaption.value.x = caption.trim().length > 0 ? 1 : 0;
    }
  }, [caption]);

  useEffect(() => {
    if (ref.current) {
      ref.current.uniforms.uLayout.value = layout.value;
      ref.current.uniforms.uTime.value = 0;
    }
  }, [layout]);

  useEffect(() => {
    if (ref.current) {
      // ref.current.uniforms.uTime.value = 0;
      ref.current.uniforms.uAnimating.value = animating ? 1 : 0;
    }
  }, [animating]);

  useEffect(() => {
    if (ref.current) {
      // ref.current.uniforms.uTime.value = 0;
      ref.current.uniforms.uSpeed.value = animationSpeed;
    }
  }, [animationSpeed]);

  useEffect(() => {
    if (ref.current) {
      // ref.current.uniforms.uTime.value = 0;
      ref.current.uniforms.uScale.value = animationScale;
    }
  }, [animationScale]);

  useEffect(() => {
    if (ref.current && isCaption !== undefined) {
      ref.current.uniforms.uCaption.value.y = isCaption ? 1 : 0;
    }
  }, [isCaption]);

  useEffect(() => {
    if (ref.current) {
      ref.current.uniforms.uLogo.value = logo.value > 0 ? 1 : 0;
    }
  }, [logo]);

  useEffect(() => {
    if (ref.current && id !== undefined) {
      ref.current.uniforms.uId.value = id;
    }
  }, [id]);

  useEffect(() => {
    if (ref.current) {
      ref.current.uniforms.uViewport.value.set(
        viewport.width,
        viewport.height,
        viewport.aspect
      );
    }
  }, [viewport]);

  // useFrame((_state, delta) => {
  //   if (ref.current) {
  //     if (animating) ref.current.uniforms.uTime.value += delta;
  //   }
  // });

  return (
    <shaderMaterial
      ref={ref}
      vertexShader={textVertexShader}
      fragmentShader={textFragmentShader}
      uniforms={uniforms}
      transparent={true}
      depthTest={false}
      depthWrite={false}
    />
  );
};

export default TextMaterial;
