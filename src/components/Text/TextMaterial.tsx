import { useEffect, useMemo, useRef } from "react";
import { Color, ShaderMaterial, Uniform } from "three";
import { ColorInfo } from "../../types";

type TextColor = Omit<ColorInfo, "contrast" | "rgb" | "rgbContrast" | "pair">;

const TextMaterial = ({
  color = { label: "White", hex: "#ffffff" },
}: {
  color?: TextColor;
}) => {
  const ref = useRef<ShaderMaterial>(null);

  // const text = useStore((state) => state.text);

  const uniforms = useMemo(() => {
    return {
      uColor: new Uniform(new Color(0xffffff)),
    };
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.uniforms.uColor.value.set(color.hex);
    }
  }, [color]);

  return (
    <shaderMaterial
      ref={ref}
      vertexShader={
        /* glsl */ `
          void main() {
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
            gl_Position = projectedPosition;
          }
        `
      }
      fragmentShader={
        /* glsl */ `
          varying vec2 vUv;
          uniform vec3 uColor;

          void main() {
            gl_FragColor = vec4(uColor, 1.);
          }
        `
      }
      uniforms={uniforms}
    />
  );
};

export default TextMaterial;
