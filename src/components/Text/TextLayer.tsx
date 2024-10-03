import { Text } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { BufferGeometry, Group, ShaderMaterial } from "three";

import useStore from "../../store/store";
import { TextAlign } from "../../types";

import TextMaterial from "./TextMaterial";

import FeijoaMedium from "/Feijoa-Medium.otf";
// import CanvasLogo from "./CanvasLogo";

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

  type TText = Text & {
    textRenderInfo: { visibleBounds: number[] };
    geometry: BufferGeometry;
    material: ShaderMaterial;
    visible: boolean;
    userData: {
      id?: number;
      pos?: { [key: number]: number[] };
    };
  };

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

  // const textLayers = [
  //   { 0: [0, 3], 1: [0, 0], 2: [2, 0] },
  //   { 0: [0, 0], 1: [1, 1], 2: [0, 0] },
  //   { 0: [0, 0], 1: [0, 2], 2: [0, 0] },
  //   { 0: [0, 0], 1: [2, 3], 2: [0, 0] },
  //   { 0: [0, 0], 1: [0, 0], 2: [0, 0] },
  //   { 0: [0, 0], 1: [0, 0], 2: [0, 0] },
  //   { 0: [0, 0], 1: [0, 0], 2: [0, 0] },
  //   { 0: [0, 0], 1: [0, 0], 2: [0, 0] },
  // ];

  // useEffect(() => {
  //   if (textGroup.current) {
  //     textGroup.current.children.forEach((text) => {
  //       if (
  //         (layout.value === 0 || layout.value === 2) &&
  //         text.userData.id !== undefined &&
  //         text.userData.id > 0
  //       )
  //         text.visible = false;
  //       else if (
  //         layout.value === 1 &&
  //         text.userData.id !== undefined &&
  //         text.userData.id > 3
  //       )
  //         text.visible = false;
  //       else text.visible = true;

  //       // text.material.uniforms.uId.value.set(
  //       //   ...text.userData.pos[layout.value]
  //       // );
  //     });
  //   }
  // }, [layout]);

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
