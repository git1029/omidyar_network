import { create } from "zustand";
import {
  customLayout,
  exportSettings,
  inputBackgroundOptions,
  inputModes,
  layouts,
  logoOptions,
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
  LogoOption,
} from "../types";

interface State {
  layout: Layout;
  customLayout: Layout;

  inputMode: InputMode;
  cameraStatus: number;
  textInput: string;
  inputBackground: { label: string; value: boolean };

  canvasSize: { width: number; height: number };

  grid: number;

  backgroundColor: ColorInfo;
  foregroundColor: ColorInfo;

  text: TextSettings;
  logo: LogoOption;
  caption: string;

  exportSettings: ExportSettings;
  videoDuration: number;

  loaded: boolean;
  fullscreen: boolean;

  patternRef: ShaderMaterial | null;
  textRef: HTMLImageElement | null;
  cameraRef: HTMLVideoElement | null;
  canvasContainerRef: HTMLDivElement | null;
  canvasRef: HTMLCanvasElement | null;
  modal: Modal | null;
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
  inputBackground: inputBackgroundOptions[0],
  layout: layouts[0],

  backgroundColor: palette[0],
  foregroundColor: palette[1],

  canvasSize: { width: 1000, height: 1000 },

  textRef: null,
  textInput: "Tech",

  text: textSettings,
  logo: logoOptions[0],
  caption: "",

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
