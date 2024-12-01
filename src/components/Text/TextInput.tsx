import { Text } from "@react-three/drei";
import { Vector3 } from "three";
import useStore from "../../store/store";
import FeijoaMedium from "/Feijoa-Medium.otf";
import { TextAlign, TroikaText } from "../../types";
import { useCallback, useEffect, useRef } from "react";

const TextInput = () => {
  const textRef = useRef<TroikaText>(null);

  const inputMode = useStore((state) => state.inputMode);
  const textInput = useStore((state) => state.textInput);
  const layout = useStore((state) => state.layout);

  const scaleText = useCallback(
    (text: TroikaText) => {
      if (text.geometry.boundingBox && text.textRenderInfo) {
        const w =
          text.textRenderInfo.visibleBounds[2] -
          text.textRenderInfo.visibleBounds[0];

        const scl = (Math.min(layout.aspect, 1) / w) * 0.9;

        text.scale.set(scl, scl, 1);
      }
    },
    [layout]
  );

  useEffect(() => {
    if (textRef.current) {
      scaleText(textRef.current);
    }
  }, [layout, textRef, scaleText]);

  const textSettings = {
    font: FeijoaMedium,
    fontSize: 0.2,
    position: new Vector3(0, 0, 0),
    maxWidth: 1,
    lineHeight: 1.05,
    textAlign: "center" as TextAlign,
    onSync: (text: TroikaText) => {
      scaleText(text);
    },
  };

  return (
    <group visible={inputMode.value === 3}>
      <mesh scale={[1, 1, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>
      <Text ref={textRef} {...textSettings} color={0xffffff}>
        {textInput}
      </Text>
    </group>
  );
};

export default TextInput;
