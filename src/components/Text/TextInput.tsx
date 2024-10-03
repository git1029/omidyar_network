import { Text } from "@react-three/drei";
// import { createPortal, useThree } from "@react-three/fiber";
// import { useState } from "react";
import { Vector3 } from "three";
import useStore from "../../store/store";
import FeijoaMedium from "/Feijoa-Medium.otf";
// import TextMaterial from "./TextMaterial";
import { TextAlign } from "../../types";

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

  const inputMode = useStore((state) => state.inputMode);
  const textInput = useStore((state) => state.textInput);
  // const patternRef = useStore((state) => state.patternRef);

  // useEffect(() => {
  //   // console.log("target");
  //   if (patternRef) {
  //     patternRef.uniforms.uText.value = target.texture;
  //   }
  // }, [target, patternRef]);

  const textSettings = {
    font: FeijoaMedium,
    fontSize: 0.4,
    position: new Vector3(0, 0, 0),
    maxWidth: 1,
    lineHeight: 1.05,
    textAlign: "center" as TextAlign,
    // onSync: (text: Text) => {
    //   console.log(text);

    //   // gl.setRenderTarget(target);
    //   // gl.render(scene, camera);
    //   // gl.setRenderTarget(null);
    // },
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
      <Text {...textSettings} color={0xffffff}>
        {textInput}
        {/* <TextMaterial /> */}
      </Text>
    </group>
  );
};

export default TextInput;
