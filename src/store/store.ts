import { create } from "zustand";
import {
  customLayout,
  exportSettings,
  inputModes,
  layouts,
  palette,
  textSettings,
} from "./options";
import { ShaderMaterial } from "three";
import {
  Layout,
  TextSettings,
  InputMode,
  ExportSettings,
  Modal,
  ColorInfo,
} from "../types";

interface State {
  layout: Layout;
  customLayout: Layout;

  inputMode: InputMode;
  cameraStatus: number;
  textInput: string;
  inputBackground: boolean;

  canvasSize: { width: number; height: number };

  grid: number;

  backgroundColor: ColorInfo;
  foregroundColor: ColorInfo;

  text: TextSettings;
  logo: boolean;

  exportSettings: ExportSettings;
  videoDuration: number;

  patternRef: ShaderMaterial | null;
  textRef: HTMLImageElement | null;
  cameraRef: HTMLVideoElement | null;
  canvasContainerRef: HTMLDivElement | null;
  canvasRef: HTMLCanvasElement | null;
  modal: Modal | null;
  loaded: boolean;
  fullscreen: boolean;
}

interface Actions {
  setValue: <K extends keyof State>(key: K, value: State[K]) => void;
}

const initalState = {
  grid: 0,
  inputMode: inputModes[1],
  cameraStatus: 0,
  loaded: false,
  modal: null,
  inputBackground: false,
  layout: layouts[0],

  backgroundColor: palette[0],
  foregroundColor: palette[1],

  canvasSize: { width: 1000, height: 1000 },

  textRef: null,
  textInput: "Tech",

  text: textSettings,
  logo: false,

  customLayout: customLayout,
  patternRef: null,
  cameraRef: null,
  canvasRef: null,
  canvasContainerRef: null,
  videoDuration: 1,
  fullscreen: false,
  exportSettings: exportSettings,
};

const useStore = create<State & Actions>((set) => ({
  ...initalState,
  setValue: (key, value) => set(() => ({ [key]: value })),
}));

useStore.subscribe((state) => console.log(state));

export default useStore;
