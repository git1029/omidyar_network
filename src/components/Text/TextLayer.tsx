import { Text } from "@react-three/drei";
import { useRef } from "react";
import { BufferGeometry, Group, ShaderMaterial } from "three";

import useStore from "../../store/store";
import { TextAlign } from "../../types";

import TextMaterial from "./TextMaterial";

import FeijoaMedium from "/Feijoa-Medium.otf";
import F37LinecaMedium from "/F37Lineca-Medium.ttf";
import CanvasLogo from "./CanvasLogo";

const TextLayer = () => {
  const { enabled, title, caption, layout, animating } = useStore(
    (state) => state.text
  );

  const textGroup = useRef<Group>(null);

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
      if (animating) {
        if (i > 7) return false;
      } else {
        if (i > 0) return false;
      }
    } else {
      if (!animating) {
        if (i > 3) return false;
      }
    }

    return true;
  };

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

  const captionSettings = {
    font: F37LinecaMedium,
    fontSize: 0.1,
    textAlign: "left" as TextAlign,
    onSync,
  };

  return (
    <>
      <CanvasLogo />

      <Text
        {...captionSettings}
        anchorX="left"
        anchorY="top"
        visible={caption.trim().length > 0}
      >
        {caption.trim().toUpperCase()}
        <TextMaterial isCaption={true} />
      </Text>

      <group ref={textGroup} visible={enabled}>
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
