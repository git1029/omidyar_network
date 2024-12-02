import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import useStore from "../store/store";
import {
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useProgress } from "@react-three/drei";
import Renderer from "./Renderer/Renderer";
import useResize, {
  scaleCanvas,
  scaleCanvasScreen,
} from "../helpers/useResize";
import Modal from "./Modal";

const Progress = ({
  setAssetsLoaded,
}: {
  setAssetsLoaded: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const progress = useProgress();

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
  const exportSettings = useStore((state) => state.exportSettings);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (assetsLoaded && canvasLoaded) setValue("loaded", true);
  }, [assetsLoaded, canvasLoaded, setValue]);

  useEffect(() => {
    if (canvasContainerRef.current) {
      setValue("canvasContainerRef", canvasContainerRef.current);
    }
  }, [canvasContainerRef, setValue]);

  useEffect(() => {
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

  useResize();

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
        <div
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
              setCanvasLoaded(true);
              if (canvasRef.current) {
                setValue("canvasRef", canvasRef.current);
              }
            }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <Progress setAssetsLoaded={setAssetsLoaded} />
            <Renderer ffmpeg={ffmpeg} />
            {debug && <Perf />}
          </Canvas>
          <div
            className={`top-0 left-0 w-full h-full absolute z-[40] pointer-events-none border border-contrast/50 ${
              fullscreen || exportSettings.exporting ? "border-0" : "border"
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
  const caption = useStore((state) => state.caption);

  const w = canvasSize.width / 34;

  const gridStyle = {
    paddingTop: w,
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
