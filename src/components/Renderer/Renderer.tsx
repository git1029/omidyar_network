import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import useExport from "../../helpers/useExport";
import { ExportObject } from "../Scene";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import useStore from "../../store/store";
import { OrthographicCamera, useFBO } from "@react-three/drei";
import { Mesh, Scene, ShaderMaterial } from "three";
import PatternGL from "../PatternGL/PatternGL";
import TextLayer from "../Text/TextLayer";
import TextInput from "../Text/TextInput";
import Background from "../Background/Background";
import Pattern from "../Pattern/Pattern";
import TextCaption from "../Text/TextCaption";
import CanvasLogo from "../Text/CanvasLogo";

const Renderer = ({
  ffmpeg,
}: {
  ffmpeg: MutableRefObject<ExportObject | null>;
}) => {
  // console.log(ffmpeg.current.ffmpegLoaded);

  // useEffect(() => {
  //   console.log("RENDERER");
  // }, []);

  // const inputMode = useStore((state) => state.inputMode);
  const patternRef = useStore((state) => state.patternRef);
  const effectRef = useStore((state) => state.effectRef);
  const textRef = useStore((state) => state.textRef);
  const text = useStore((state) => state.text);
  const { exporting } = useStore((state) => state.exportSettings);

  const { gl, camera, size, viewport } = useThree();

  const render = useRef({
    frameCount: 0,
    deltaTime: 0,
    reset: false,
    exportPrep: false,
  });

  const renderTargetSettings = {
    depthBuffer: false,
    // format: RGBAFormat
  };

  const dpr = Math.min(viewport.dpr, 2);

  const targetTextInput = useFBO(512, 512, renderTargetSettings);
  const targetPattern = useFBO(
    size.width * dpr,
    size.height * dpr,
    renderTargetSettings
  );
  const targetText = useFBO(
    size.width * dpr,
    size.height * dpr,
    renderTargetSettings
  );

  const sceneTextInput = useMemo(() => new Scene(), []);
  const sceneText = useMemo(() => new Scene(), []);
  const scenePattern = useMemo(() => new Scene(), []);

  useEffect(() => {
    if (effectRef) {
      effectRef.uniforms.uPattern.value = targetPattern.texture;
      effectRef.uniforms.uText.value = targetText.texture;
    }

    if (patternRef) {
      patternRef.uniforms.uText.value = targetTextInput.texture;
    }
  }, [targetPattern, targetText, targetTextInput, effectRef, patternRef]);

  const renderTextInput = () => {
    gl.setRenderTarget(targetTextInput);
    gl.clear();
    gl.render(sceneTextInput, camera);
  };

  const renderText = () => {
    gl.setRenderTarget(targetText);
    gl.clear();
    gl.render(sceneText, camera);
  };

  const renderPattern = () => {
    gl.setRenderTarget(targetPattern);
    gl.clear();
    gl.render(scenePattern, camera);
  };

  const renderScene = () => {
    // console.log("RENDERING SCENE", render.current.exportPrep);

    renderTextInput();
    renderText();
    renderPattern();

    // if (!exportSettings.exporting) {
    gl.setRenderTarget(null);
    // }
  };

  // const setTime = (time: number) => {
  //   if (textRef && text.animating) {
  //     textRef.children.forEach(
  //       (child) =>
  //         (((child as Mesh).material as ShaderMaterial).uniforms.uTime.value =
  //           time)
  //     );
  //   }

  //   if (patternRef) {
  //     patternRef.uniforms.uTime.value = time;
  //   }

  //   if (effectRef && effectRef.uniforms.uEffect.value.z === 1) {
  //     effectRef.uniforms.uTime.value = time;
  //   }
  // };

  ffmpeg.current = useExport({ render: render.current, renderScene });

  useFrame((_state, delta) => {
    // const time = exportSettings.exporting
    //   ? render.current.frameCount
    //   : render.current.deltaTime;

    // setTime(time);

    if (!exporting) {
      if (textRef && text.animating) {
        textRef.children.forEach((child) => {
          const mesh = child as Mesh;
          const material = mesh.material as ShaderMaterial;
          material.uniforms.uTime.value += delta;
        });
      }

      if (patternRef) {
        patternRef.uniforms.uTime.value += delta;
      }

      if (effectRef && effectRef.uniforms.uEffect.value.z === 1) {
        effectRef.uniforms.uTime.value += delta;
      }
    }

    if (!exporting || render.current.exportPrep) {
      renderScene();
    }

    // render.current.deltaTime += delta;
    // render.current.frameCount++;
  });

  return (
    <>
      <OrthographicCamera
        near={-1}
        far={1}
        left={-0.5}
        right={0.5}
        top={0.5}
        bottom={-0.5}
        manual
        makeDefault
      />

      {createPortal(<TextInput />, sceneTextInput)}
      {createPortal(<PatternGL />, scenePattern)}
      {createPortal(<TextLayer />, sceneText)}

      <Background />
      <Pattern />
      <TextCaption />
      <CanvasLogo />
    </>
  );
};

export default Renderer;
