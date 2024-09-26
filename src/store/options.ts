import { Color } from "three";
import {
  ColorInfo,
  InputMode,
  Layout,
  TextLayout,
  TextSettings,
} from "../types";

const paletteNeutral = [
  {
    label: "White",
    hex: "#ffffff",
    contrast: "#3a3a3a",
    pair: "Black",
    type: "neutral",
  },
  {
    label: "Gray",
    hex: "#e4e5e6",
    contrast: "#3a3a3a",
    pair: "Black",
    type: "neutral",
  },
  {
    label: "Black",
    hex: "#3a3a3a",
    contrast: "#ffffff",
    pair: "White",
    type: "neutral",
  },
  {
    label: "Transparent",
    hex: "#ffffff",
    contrast: "#3a3a3a",
    pair: "Black",
    type: "neutral",
  },
];

const paletteBase = [
  {
    label: "Bright Green",
    hex: "#5dc0a4",
    contrast: "#3a3a3a",
    pair: "Light Green",
    type: "base",
  },
  {
    label: "Light Green",
    hex: "#b5e2dd",
    contrast: "#3a3a3a",
    pair: "Bright Green",
    type: "base",
  },
  {
    label: "Bright Blue",
    hex: "#8ba9f5",
    contrast: "#3a3a3a",
    pair: "Light Blue",
    type: "base",
  },
  {
    label: "Light Blue",
    hex: "#c9d2ff",
    contrast: "#3a3a3a",
    pair: "Bright Blue",
    type: "base",
  },
  {
    label: "Bright Purple",
    hex: "#a57ec9",
    contrast: "#ffffff",
    pair: "Light Purple",
    type: "base",
  },
  {
    label: "Light Purple",
    hex: "#cfbcea",
    contrast: "#3a3a3a",
    pair: "Bright Purple",
    type: "base",
  },
  {
    label: "Bright Red",
    hex: "#df6651",
    contrast: "#ffffff",
    pair: "Light Red",
    type: "base",
  },
  {
    label: "Light Red",
    hex: "#f3af9f",
    contrast: "#3a3a3a",
    pair: "Bright Red",
    type: "base",
  },
  {
    label: "Bright Orange",
    hex: "#f08c00",
    contrast: "#3a3a3a",
    pair: "Light Orange",
    type: "base",
  },
  {
    label: "Light Orange",
    hex: "#eec07c",
    contrast: "#3a3a3a",
    pair: "Bright Orange",
    type: "base",
  },
  {
    label: "Bright Yellow",
    hex: "#e3ec31",
    contrast: "#3a3a3a",
    pair: "Light Yellow",
    type: "base",
  },
  {
    label: "Light Yellow",
    hex: "#f6f69f",
    contrast: "#3a3a3a",
    pair: "Bright Yellow",
    type: "base",
  },
  ...paletteNeutral,
];

// Get RGB values for tailwind
export const palette: ColorInfo[] = paletteBase.map((p) => {
  const c = new Color(p.hex).convertLinearToSRGB();
  const rgb = [c.r, c.g, c.b].map((c) => Math.round(c * 255));

  const cContrast = new Color(p.contrast).convertLinearToSRGB();
  const rgbContrast = [cContrast.r, cContrast.g, cContrast.b].map((c) =>
    Math.round(c * 255)
  );

  return { ...p, rgb, rgbContrast };
});

export const patternSettings = {
  patternDotSize: 0.25,
  patternContrast: 0.5,
  patternFrequency: 0.5,
  patternDensityX: 0.5,
  patternDensityY: 0.5,
};

export const gridSettings = {
  gridType: 0,
  gridConnectors: [true, false],
  gridQuantity: 9,
};

export const inputModes: InputMode[] = [
  {
    label: "Image",
    file: true,
    accepts: ["image/jpeg", "image/jpg", "image/png"],
    value: 0,
  },
  {
    label: "Video",
    file: true,
    accepts: ["video/mp4", "video/webm"],
    value: 1,
  },
  {
    label: "Camera",
    value: 2,
  },
  {
    label: "Text",
    value: 3,
  },
];

export const customLayout: Layout = {
  label: "Custom",
  aspect: 1,
  size: { width: 500, height: 500 },
};

export const layouts: Layout[] = [
  { label: "1:1", aspect: 1, size: { width: 2160, height: 2160 } },
  { label: "4:5", aspect: 4 / 5, size: { width: 3072, height: 3840 } },
  { label: "5:4", aspect: 5 / 4, size: { width: 3840, height: 3072 } },
  { label: "9:16", aspect: 9 / 16, size: { width: 2160, height: 3840 } },
  { label: "16:9", aspect: 16 / 9, size: { width: 3840, height: 2160 } },
  customLayout,
];

export const textPalette: ColorInfo[] = [
  ...palette.filter((c) => c.type === "neutral" && c.label !== "Transparent"),
];

// {
//   label: "White",
//   hex: "#ffffff",
//   contrast: "#3a3a3a",
//   rgb: [255, 255, 255],
//   rgbContrast: [58, 58, 58],
//   pair: "Black",
// },
// {
//   label: "Black",
//   hex: "#3a3a3a",
//   contrast: "#ffffff",
//   rgb: [58, 58, 58],
//   rgbContrast: [255, 255, 255],
//   pair: "White",
// },

export const textLayoutOptions: TextLayout[] = [
  {
    label: "Layout 1",
    value: 0,
  },
  {
    label: "Layout 2",
    value: 1,
  },
  {
    label: "Layout 3",
    value: 2,
  },
];

export const textSettings: TextSettings = {
  enabled: true,
  layout: textLayoutOptions[0],
  title: "Shaping\nTomorrow",
  titleSize: 5,
  color: textPalette[0],
  caption: "",
  animating: false,
  animationSpeed: 0.3333,
  animationScale: 0,
};

export const exportFormats = [
  { label: "PNG", type: "image/png", ext: "png", typeRoot: "image" },
  { label: "MP4", type: "video/mp4", ext: "mp4", typeRoot: "video" },
];

export const exportSettings = {
  ffmpegLoaded: false,
  format: exportFormats[0],
  exporting: false,
};

// const maxWidthAspect = Math.max(
//   ...layouts.map((l) => l.size.width / l.size.height)
// );

// const layoutDefault = layouts.find(
//   (l) => l.size.width / l.size.height === maxWidthAspect
// );

// const cameraSettings = {
//   fov: 45,
//   near: 0.01,
//   far: 100,
//   position: [0, 0, 20],
//   aspect: layoutDefault.size.width / layoutDefault.size.height,
// };
