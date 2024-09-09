import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import PatternGL from "./PatternGL/PatternGL";
import TextInput from "./Text/TextInput";
import TextLayer from "./Text/TextLayer";
import useStore from "../store/store";
import {
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useProgress } from "@react-three/drei";
import Logo from "/logo.svg";
import Renderer from "./Renderer/Renderer";
// import PatternSVG from "./PatternSVG/PatternSVG2";

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
  const setCanvasContainerRef = useStore(
    (state) => state.setCanvasContainerRef
  );

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const fade = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (canvasContainerRef.current) {
      setCanvasContainerRef(canvasContainerRef.current);
    }
  }, [canvasContainerRef, setCanvasContainerRef]);

  const loaded = canvasLoaded && assetsLoaded;

  // console.log(`aspect-[${layout.label.split(":").join("/")}]`);

  // console.log(layout.label.split(":").join("/"));

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full h-full bg-gray-100 pointer-events-none z-50 transition-opacity duration-500 delay-500 ease-in-out flex flex-col gap-y-2 items-center justify-center ${
          loaded ? "opacity-0" : "opacity-1"
        }`}
        ref={fade}
        onTransitionEnd={() => {
          if (fade.current) fade.current.style.display = "none";
        }}
      >
        <img
          src={Logo}
          onTransitionEnd={(e) => e.stopPropagation()}
          className={`transition-transform duration-500 delay-500 ease-in-out ${
            loaded ? "scale-150" : "scale-100"
          }`}
        />
        {/* <div
          onTransitionEnd={(e) => e.stopPropagation()}
          className={`h-0.5 bg-black-100 w-[125px] transition-transform duration-500 delay-250 ease-in-out origin-bottom-left ${
            loaded ? "scale-x-100" : "scale-x-0"
          }`}
        ></div> */}
      </div>
      <div className="flex grow px-8 border-0 border-black-100 rounded-sm items-center justify-center relative min-w-0">
        {/* <div className="h-full w-full"> */}
        <div
          className={`max-h-[1000px] max-w-[1000px] border border-transparent ${
            layout.aspect >= 1 ? "w-full h-auto" : "h-full w-auto"
          }`}
          style={{ aspectRatio: layout.aspect }}
          ref={canvasContainerRef}
        >
          <Canvas
            dpr={[1, 2]}
            onCreated={() => {
              // console.log("ready");
              setCanvasLoaded(true);
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
            <TextLayer />
            <Perf />
            <Renderer ffmpeg={ffmpeg} />
          </Canvas>
        </div>
      </div>
    </>
  );
};

export default Scene;
