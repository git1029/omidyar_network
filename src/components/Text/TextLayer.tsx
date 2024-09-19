import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
// import { useState } from "react";
import { Vector3 } from "three";
import useStore from "../../store/store";
import FeijoaMedium from "/Feijoa-Medium.otf";
import TextMaterial from "./TextMaterial";
import { TextAlign } from "../../types";

const TextLayer = () => {
  const { viewport } = useThree();

  const { enabled, title, titleSize, body, color } = useStore(
    (state) => state.text
  );

  // if (!enabled) return null;

  // useEffect(() => {
  //   // console.log("target");
  //   if (patternRef) {
  //     patternRef.uniforms.uText.value = target.texture;
  //   }
  // }, [target, patternRef]);

  const textSettings = {
    font: FeijoaMedium,
    fontSize: titleSize * 0.1,
    position: new Vector3(0, 0, 0.01),
    maxWidth: viewport.width * 0.9,
    lineHeight: 1,
    textAlign: "left" as TextAlign,
    // textAlign: "left",
    // onSync: (text: Text) => {
    //   console.log(text);

    //   // gl.setRenderTarget(target);
    //   // gl.render(scene, camera);
    //   // gl.setRenderTarget(null);
    // },
  };

  return (
    <group visible={enabled}>
      <Text {...textSettings} position={[0, 0.1, 0]} anchorY="bottom-baseline">
        {title}
        <TextMaterial color={color} />
      </Text>
      <Text
        {...textSettings}
        fontSize={titleSize * 0.05}
        anchorY="top"
        position={[0, -0.1, 0]}
      >
        {body}
        <TextMaterial color={color} />
      </Text>
    </group>
  );
};

export default TextLayer;
