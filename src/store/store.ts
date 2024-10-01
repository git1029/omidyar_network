import { create } from "zustand";
import {
  customLayout,
  defaultUpload,
  exportSettings,
  gridOptions,
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
  Upload,
} from "../types";

interface State {
  layout: Layout;
  customLayout: Layout;

  inputMode: InputMode;
  cameraStatus: number;
  textInput: string;
  inputBackground: { label: string; value: boolean };

  canvasSize: { width: number; height: number };

  grid: {
    label: string;
    value: number;
  };

  backgroundColor: ColorInfo;
  foregroundColor: ColorInfo;

  text: TextSettings;
  logo: LogoOption;
  caption: string;

  exportSettings: ExportSettings;
  ffmpegLoaded: boolean;
  videoDuration: number | null;

  imageUpload: Upload | null;
  videoUpload: Upload | null;

  loaded: boolean;
  fullscreen: boolean;

  patternRef: ShaderMaterial | null;
  effectRef: ShaderMaterial | null;
  backgroundRef: ShaderMaterial | null;
  textRef: HTMLImageElement | null;
  cameraRef: HTMLVideoElement | null;
  videoRef: HTMLVideoElement | null;
  canvasContainerRef: HTMLDivElement | null;
  canvasRef: HTMLCanvasElement | null;
  modal: Modal | null;
}

interface Actions {
  setValue: <K extends keyof State>(key: K, value: State[K]) => void;
}

const initalState = {
  grid: gridOptions[0],

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

  imageUpload: defaultUpload.image,
  videoUpload: defaultUpload.video,

  exportSettings: exportSettings,
  ffmpegLoaded: false,

  customLayout: customLayout,
  patternRef: null,
  effectRef: null,
  backgroundRef: null,
  cameraRef: null,
  videoRef: null,
  canvasRef: null,
  canvasContainerRef: null,
  videoDuration: 1,
  fullscreen: false,
};

const useStore = create<State & Actions>((set) => ({
  ...initalState,
  setValue: (key, value) => set(() => ({ [key]: value })),
}));

useStore.subscribe((state) => console.log(state));

export default useStore;
