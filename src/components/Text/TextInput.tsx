import { Text } from "@react-three/drei";
// import { createPortal, useThree } from "@react-three/fiber";
// import { useState } from "react";
import { Vector3 } from "three";
import useStore from "../../store/store";
import FeijoaMedium from "/Feijoa-Medium.otf";
// import TextMaterial from "./TextMaterial";
import { TextAlign, TroikaText } from "../../types";
import { useCallback, useEffect, useRef } from "react";

// const TextInput = () => {
//   const [scene] = useState(() => new Scene());

//   const inputMode = useStore((state) => state.inputMode);

//   // if (inputMode.value !== 3) return null;

//   return (
//     <group visible={inputMode.value === 3}>
//       {createPortal(<TextScene scene={scene} />, scene)}
//     </group>
//   );
// };

const TextInput = () => {
  // const inputMode = useStore((state) => state.inputMode);
  // const { camera } = useThree();

  // const target = useFBO(512, 512);
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
        // const h =
        //   text.geometry.boundingBox.max.y - text.geometry.boundingBox.min.y;

        const scl = (Math.min(layout.aspect, 1) / w) * 0.9;

        text.scale.set(scl, scl, 1);
      }
    },
    [layout]
  );

  // const patternRef = useStore((state) => state.patternRef);

  // useEffect(() => {
  //   // console.log("target");
  //   if (patternRef) {
  //     patternRef.uniforms.uText.value = target.texture;
  //   }
  // }, [target, patternRef]);

  useEffect(() => {
    // console.log(textRef.current);
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
      // console.log(text);
      scaleText(text);

      // gl.setRenderTarget(target);
      // gl.render(scene, camera);
      // gl.setRenderTarget(null);
    },
  };

  // useFrame(({ gl }) => {
  //   if (inputMode.value !== 3) return;

  //   gl.setRenderTarget(target);
  //   gl.render(scene, camera);

  //   if (patternRef && patternRef.uniforms.uText.value === null) {
  //     patternRef.uniforms.uText.value = target.texture;
  //   }

  //   gl.setRenderTarget(null);
  // });

  return (
    <group visible={inputMode.value === 3}>
      <mesh scale={[1, 1, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>
      <Text ref={textRef} {...textSettings} color={0xffffff}>
        {textInput}
        {/* <TextMaterial /> */}
      </Text>
    </group>
  );
};

export default TextInput;
