import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import PatternGL from "./PatternGL/PatternGL";
import TextInput from "./Text/TextInput";
// import TextLayer from "./Text/TextLayer";
import useStore from "../store/store";
import {
  MutableRefObject,
  // RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useProgress } from "@react-three/drei";
// import Logo from "/logo_light.svg";
import Renderer from "./Renderer/Renderer";
import useResize, {
  scaleCanvas,
  scaleCanvasScreen,
} from "../helpers/useResize";
import Modal from "./Modal";
// import { clamp } from "three/src/math/MathUtils.js";
// import PatternSVG from "./PatternSVG/PatternSVG4";

const Progress = ({
  setAssetsLoaded,
}: {
  setAssetsLoaded: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const progress = useProgress();
  // console.log(progress);

  useEffect(() => {
    if (progress.progress === 100) {
      setAssetsLoaded(true);
    }
  }, [progress, setAssetsLoaded]);

  return null;
};

export interface ExportObject {
  ffmpegLoaded: boolean;
  download: () => Promise<void>;
}

const Scene = ({
  ffmpeg,
}: {
  ffmpeg: MutableRefObject<ExportObject | null>;
}) => {
  const layout = useStore((state) => state.layout);
  const setCanvasRef = useStore((state) => state.setCanvasRef);
  const setCanvasContainerRef = useStore(
    (state) => state.setCanvasContainerRef
  );

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);

  const setLoaded = useStore((state) => state.setLoaded);
  const fullscreen = useStore((state) => state.fullscreen);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  // const fade = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (assetsLoaded && canvasLoaded) setLoaded(true);
  }, [assetsLoaded, canvasLoaded, setLoaded]);

  useEffect(() => {
    if (canvasContainerRef.current) {
      setCanvasContainerRef(canvasContainerRef.current);
    }
  }, [canvasContainerRef, setCanvasContainerRef]);

  useEffect(() => {
    // console.log(window.devicePixelRatio);
    if (fullscreen) {
      scaleCanvasScreen();
    } else {
      scaleCanvas(layout);
    }
  }, [fullscreen, layout]);

  const [debug] = useState(
    typeof window !== "undefined" &&
      window.location.href.toLowerCase().includes("debug")
  );

  // const loaded = canvasLoaded && assetsLoaded;
  // const loaded = false;

  // console.log(`aspect-[${layout.label.split(":").join("/")}]`);

  // console.log(layout.label.split(":").join("/"));

  useResize();

  // scl();

  // const scl = () => {
  //   const br = 1;
  //   const padX = 32;
  //   const padY = 32;
  //   const panelWidth = 630;

  //   // const minWidth = 1280;
  //   // const minHeight = 600;

  //   const limit = {
  //     min: 320,
  //     max: 1000,
  //   };

  //   let availableWidth =
  //     clamp(window.innerWidth, 1280, 2560) - panelWidth - padX * 2 - br * 2;
  //   let availableHeight =
  //     clamp(window.innerHeight, 600, 2560) - padY * 2 - br * 2;

  //   availableWidth = clamp(availableWidth, limit.min, limit.max);
  //   availableHeight = clamp(availableHeight, limit.min, limit.max);

  //   console.log(availableWidth / availableHeight, layout.aspect);
  //   return availableWidth / availableHeight < layout.aspect;
  // };

  return (
    <>
      <div
        className={`flex grow items-center justify-center min-w-0 min-h-0 overflow-hidden ${
          fullscreen
            ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : "relative"
        }`}
      >
        <Modal />
        {/* <div className="h-full w-full"> */}
        <div
          // className="w-full h-full"
          className={`border-foreground/50 box-content relative transition-opacity duration-500 ease-in-out ${
            assetsLoaded && canvasLoaded ? "" : "opacity-0"
          } ${fullscreen ? "border-0" : "border"}`}
          style={{ aspectRatio: layout.aspect }}
          ref={canvasContainerRef}
        >
          <Canvas
            dpr={[1, 2]}
            ref={canvasRef}
            resize={{ debounce: 50, scroll: false }}
            onCreated={() => {
              // console.log("ready");
              setCanvasLoaded(true);

              if (canvasRef.current) {
                setCanvasRef(canvasRef.current);
              }
              // gl.setClearColor(0x000000);
            }}
            camera={{
              fov: 45,
              near: 0.01,
              far: 100,
              position: [0, 0, 5], // 20
            }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <Progress setAssetsLoaded={setAssetsLoaded} />
            <TextInput />
            <PatternGL />
            {/* <PatternSVG /> */}
            {/* <TextLayer /> */}
            {debug && <Perf />}
            <Renderer ffmpeg={ffmpeg} />
          </Canvas>
        </div>
      </div>
    </>
  );
};

export default Scene;
