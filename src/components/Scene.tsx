import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import PatternScene from "./PatternGL/PatternGL";
import TextInput from "./Text/TextInput";
import TextLayer from "./Text/TextLayer";
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
// import PatternSVG from "./PatternSVG/PatternSVG3b";

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
  const setValue = useStore((state) => state.setValue);

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);

  const fullscreen = useStore((state) => state.fullscreen);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  // const fade = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (assetsLoaded && canvasLoaded) setValue("loaded", true);
  }, [assetsLoaded, canvasLoaded, setValue]);

  useEffect(() => {
    if (canvasContainerRef.current) {
      setValue("canvasContainerRef", canvasContainerRef.current);
    }
  }, [canvasContainerRef, setValue]);

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

  // const [logo, setLogo] = useState(false);

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

  // const w = canvasContainerRef.current
  //   ? (canvasContainerRef.current.offsetWidth * 1) / 34
  //   : 0;
  // console.log(gridStyle, "GRIDSTYLE");

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
          className={`relative transition-opacity duration-500 ease-in-out ${
            assetsLoaded && canvasLoaded ? "" : "opacity-0"
          }`}
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
                setValue("canvasRef", canvasRef.current);
              }
              // gl.setClearColor(0x000000);
            }}
            // camera={{
            //   fov: 45,
            //   near: 0.01,
            //   far: 100,
            //   position: [0, 0, 5], // 20
            // }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <Progress setAssetsLoaded={setAssetsLoaded} />
            <TextInput />
            <PatternScene />
            {/* <PatternSVG /> */}
            <TextLayer />
            {debug && <Perf />}
            <Renderer ffmpeg={ffmpeg} />
          </Canvas>
          <div
            className={`top-0 left-0 w-full h-full absolute z-50 pointer-events-none border border-foreground/50 ${
              fullscreen ? "border-0" : "border"
            }`}
          ></div>
          <Grid debug={debug} />
        </div>
      </div>
    </>
  );
};

const Grid = ({ debug }: { debug: boolean }) => {
  const canvasSize = useStore((state) => state.canvasSize);
  const logo = useStore((state) => state.logo);
  const caption = useStore((state) => state.caption);

  const w = canvasSize.width / 34;

  // console.log("WIDTH", canvasContainerRef?.current?.offsetWidth);

  const gridStyle = {
    paddingTop: logo.value > 0 ? w * 2 : w,
    paddingBottom: caption.length > 0 ? w * 2 : w,
    paddingLeft: w,
    paddingRight: w,
    columnGap: w / 2,
    rowGap: w / 2,
  };

  const gridStyle0 = {
    ...gridStyle,
    paddingTop: w,
    paddingBottom: w,
  };

  if (!debug) return null;

  return (
    <div className="top-0 left-0 w-full h-full absolute z-50 pointer-events-none">
      <div
        className="absolute top-0 left-0 w-full h-full flex"
        style={gridStyle0}
      >
        <div className="border border-blue-500 grow"></div>
        <div className="border border-blue-500 grow"></div>
        <div className="border border-blue-500 grow"></div>
        <div className="border border-blue-500 grow"></div>
      </div>
      <div
        className="absolute top-0 left-0 w-full h-full flex"
        style={gridStyle}
      >
        <div className="border border-pink-500 grow"></div>
        <div className="border border-pink-500 grow"></div>
        <div className="border border-pink-500 grow"></div>
        <div className="border border-pink-500 grow"></div>
      </div>
      <div
        className="absolute top-0 left-0 w-full h-full flex flex-col"
        style={gridStyle}
      >
        <div className="border border-pink-500 grow"></div>
        <div className="border border-pink-500 grow"></div>
        <div className="border border-pink-500 grow"></div>
        <div className="border border-pink-500 grow"></div>
      </div>
    </div>
  );
};

export default Scene;
