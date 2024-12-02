import { create } from "zustand";
import {
  backgroundEffectOptions,
  customLayout,
  defaultUpload,
  exportSettings,
  gridOptions,
  inputBackgroundOptions,
  inputModes,
  layouts,
  logoOptions,
  palette,
  patternEffectOptions,
  textSettings,
} from "./options";
import { Group, ShaderMaterial } from "three";
import {
  Layout,
  TextSettings,
  InputMode,
  ExportSettings,
  Modal,
  ColorInfo,
  LogoOption,
  Upload,
  EffectSettings,
  BackgroundEffectSetting,
} from "../types";

interface State {
  layout: Layout;
  customLayout: Layout;

  inputMode: InputMode;
  cameraStatus: number;
  textInput: string;
  inputBackground: { label: string; value: number };

  canvasSize: { width: number; height: number };

  grid: {
    label: string;
    value: number;
  };

  backgroundColor: ColorInfo;
  foregroundColor: ColorInfo;

  patternEffect: EffectSettings;

  backgroundEffect: BackgroundEffectSetting;

  text: TextSettings;
  logo: LogoOption;
  caption: string;

  exportSettings: ExportSettings;
  ffmpegLoaded: boolean;
  exportCancelled: boolean;

  imageUpload: Upload | null;
  videoUpload: Upload | null;
  videoPaused: boolean;
  videoDuration: number | null;

  loaded: boolean;
  fullscreen: boolean;

  mobileAgent: boolean;

  patternRef: ShaderMaterial | null;
  effectRef: ShaderMaterial | null;
  backgroundRef: ShaderMaterial | null;
  textRef: Group | null;
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

  textInput: "Tech",

  text: textSettings,
  logo: logoOptions[0],
  caption: "",

  patternEffect: {
    mode: patternEffectOptions.modes[0],
    style: patternEffectOptions.styles[0],
    animating: true,
  },

  backgroundEffect: backgroundEffectOptions[0],

  imageUpload: defaultUpload.image,
  videoUpload: defaultUpload.video,
  videoPaused: false,

  exportSettings: exportSettings,
  exportCancelled: false,
  ffmpegLoaded: false,

  mobileAgent: false,

  customLayout: customLayout,
  patternRef: null,
  effectRef: null,
  backgroundRef: null,
  cameraRef: null,
  videoRef: null,
  canvasRef: null,
  canvasContainerRef: null,
  textRef: null,
  videoDuration: null,
  fullscreen: false,
};

const useStore = create<State & Actions>((set) => ({
  ...initalState,
  setValue: (key, value) => set(() => ({ [key]: value })),
}));

useStore.subscribe((state) => console.log(state));

export default useStore;
