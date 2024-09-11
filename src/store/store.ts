import { create } from "zustand";
import {
  customLayout,
  exportSettings,
  inputModes,
  layouts,
  textSettings,
} from "./options";
import { ShaderMaterial } from "three";
import {
  Layout,
  TextSettings,
  InputMode,
  ExportSettings,
  Modal,
} from "../types";
// import { string } from "three/webgpu";

interface State {
  grid: number;
  setGrid: (grid: number) => void;

  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;

  cameraStatus: number;
  setCameraStatus: (status: number) => void;

  textInput: string;
  setTextInput: (textInput: string) => void;

  layout: Layout;
  setLayout: (layout: Layout) => void;

  customLayout: Layout;
  setCustomLayout: (customLayout: Layout) => void;

  text: TextSettings;
  setText: (text: TextSettings) => void;

  exportSettings: ExportSettings;
  setExportSettings: (exportSettings: ExportSettings) => void;

  // patternDotSize: number;
  // patternContrast: number;
  // patternFrequency: number;
  // patternDensityX: number;
  // patternDensityY: number;

  // setPatternDotSize: (size: number) => void;
  // setPatternContrast: (contrast: number) => void;
  // setPatternFrequency: (frequency: number) => void;
  // setPatternDensityX: (density: number) => void;
  // setPatternDensityY: (density: number) => void;

  // gridType: number;
  // gridQuantity: number;

  // setGridType: (type: number) => void;
  // setGridQuantity: (quantity: number) => void;

  patternRef: ShaderMaterial | null;
  setPatternRef: (ref: ShaderMaterial) => void;

  textRef: HTMLImageElement | null;
  setTextRef: (ref: HTMLImageElement) => void;

  cameraRef: HTMLVideoElement | null;
  setCameraRef: (ref: HTMLVideoElement) => void;

  canvasContainerRef: HTMLDivElement | null;
  setCanvasContainerRef: (ref: HTMLDivElement) => void;
  canvasRef: HTMLCanvasElement | null;
  setCanvasRef: (ref: HTMLCanvasElement) => void;

  modal: Modal | null;
  setModal: (modal: Modal) => void;
}

const useStore = create<State>((set) => ({
  // backgroundColor: colors[0],
  // nodeColor: colors[1],
  // setBackgroundColor: (backgroundColor) => set(() => ({ backgroundColor })),
  // setNodeColor: (nodeColor) => set(() => ({ nodeColor })),
  grid: 0,
  setGrid: (grid) => set(() => ({ grid })),

  inputMode: inputModes[0],
  setInputMode: (mode) => set(() => ({ inputMode: mode })),

  cameraStatus: 0,
  setCameraStatus: (status) => set(() => ({ cameraStatus: status })),

  textInput: "Tech",
  setTextInput: (textInput) => set(() => ({ textInput })),

  textRef: null,
  setTextRef: (ref) => set(() => ({ textRef: ref })),

  modal: null,
  setModal: (modal) => set(() => ({ modal })),

  // ...patternSettings,
  // setPatternDotSize: (size) => set(() => ({ patternDotSize: size })),
  // setPatternContrast: (contrast) => set(() => ({ patternContrast: contrast })),
  // setPatternFrequency: (frequency) =>
  //   set(() => ({ patternFrequency: frequency })),
  // setPatternDensityX: (density) => set(() => ({ patternDensityX: density })),
  // setPatternDensityY: (density) => set(() => ({ patternDensityY: density })),

  // ...gridSettings,
  // setGridType: (type) => set(() => ({ gridType: type })),
  // setGridQuantity: (quantity) => set(() => ({ gridQuantity: quantity })),

  layout: layouts[0],
  setLayout: (layout) => set(() => ({ layout })),

  customLayout: customLayout,
  setCustomLayout: (customLayout) => set(() => ({ customLayout })),

  patternRef: null,
  setPatternRef: (ref) => set(() => ({ patternRef: ref })),
  cameraRef: null,
  setCameraRef: (ref) => set(() => ({ cameraRef: ref })),

  canvasRef: null,
  setCanvasRef: (ref) => set(() => ({ canvasRef: ref })),
  canvasContainerRef: null,
  setCanvasContainerRef: (ref) => set(() => ({ canvasContainerRef: ref })),

  text: textSettings,
  setText: (text: TextSettings) => set(() => ({ text })),

  exportSettings: exportSettings,
  setExportSettings: (exportSettings: ExportSettings) =>
    set(() => ({ exportSettings })),
}));

useStore.subscribe((state) => console.log(state));

export default useStore;
