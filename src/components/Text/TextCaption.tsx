import { Text } from "@react-three/drei";
import { BufferGeometry, ShaderMaterial } from "three";

import useStore from "../../store/store";
import { TextAlign } from "../../types";

import TextMaterial from "./TextMaterial";

import F37LinecaMedium from "/F37Lineca-Medium.otf";

const TextCaption = () => {
  const caption = useStore((state) => state.caption);
  const fullscreen = useStore((state) => state.fullscreen);

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

  const captionSettings = {
    font: F37LinecaMedium,
    fontSize: 0.1,
    textAlign: "left" as TextAlign,
    onSync,
  };

  return (
    <>
      <group visible={!fullscreen}>
        <Text
          {...captionSettings}
          anchorX="left"
          anchorY="top"
          visible={caption.trim().length > 0}
        >
          {caption.trim().toUpperCase()}
          <TextMaterial isCaption={true} />
        </Text>
      </group>
    </>
  );
};

export default TextCaption;
