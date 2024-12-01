import { Text } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Group } from "three";
import useStore from "../../store/store";
import { TextAlign, TroikaText } from "../../types";
import TextMaterial from "./TextMaterial";
import FeijoaMedium from "/Feijoa-Medium.otf";

type TText = Text & TroikaText;

const TextLayer = () => {
  const { mode, title, layout, animationScale } = useStore(
    (state) => state.text
  );
  const fullscreen = useStore((state) => state.fullscreen);
  const setValue = useStore((state) => state.setValue);

  const textGroup = useRef<Group>(null);

  useEffect(() => {
    if (textGroup.current) {
      setValue("textRef", textGroup.current);
    }
  }, [textGroup, setValue]);

  const textLayers = [...Array(12).keys()];

  const isVisible = (i: number) => {
    if (layout.value !== 1) {
      if (mode.value === 2) {
        if (i > 7) return false;
      } else {
        if (i > 0) return false;
      }
    } else {
      if (mode.value !== 2) {
        if (i > 3) return false;
      }
    }

    return true;
  };

  useEffect(() => {
    if (textGroup.current) {
      if (mode.value === 2) {
        const scl = animationScale + 1;
        textGroup.current.scale.set(scl, scl, 1);
        textGroup.current.position.set(
          (animationScale - (2 / 34) * animationScale) / 2,
          (animationScale - (2 / 34) * animationScale) / 2,
          0
        );
      } else {
        textGroup.current.position.set(0, 0, 0);
        textGroup.current.scale.set(1, 1, 1);
      }
    }
  }, [mode, animationScale, textGroup]);

  const onSync = (text: TText) => {
    if (text.geometry.boundingBox && text.textRenderInfo) {
      text.material.uniforms.uBounds.value.set(
        text.textRenderInfo.visibleBounds[0],
        text.geometry.boundingBox.min.y,
        text.textRenderInfo.visibleBounds[2],
        text.geometry.boundingBox.max.y
      );
    }
  };

  const textSettings = {
    font: FeijoaMedium,
    fontSize: 0.1,
    lineHeight: 1.05,
    textAlign: "left" as TextAlign,
    onSync,
  };

  return (
    <>
      <group ref={textGroup} visible={mode.value > 0 && !fullscreen}>
        {textLayers.map((_l, i) => (
          <Text
            key={`text_layer_${i}`}
            {...textSettings}
            anchorX="left"
            anchorY="top"
            visible={isVisible(i)}
          >
            {title.trim()}
            <TextMaterial id={i} />
          </Text>
        ))}
      </group>
    </>
  );
};

export default TextLayer;
