// import { Vector2 } from "three";

import { ColorInfo, InputMode } from "../types";

export const palette: ColorInfo[] = [
  { label: "Bright Green", hex: "#5dc0a4" },
  { label: "Light Green", hex: "#b5e2dd" },
  { label: "Bright Blue", hex: "#8ba9f5" },
  { label: "Light Blue", hex: "#c9d2ff" },
  { label: "Bright Purple", hex: "#a57ec9" },
  { label: "Light Purple", hex: "#cfbcea" },
  { label: "Bright Red", hex: "#df6651" },
  { label: "Light Red", hex: "#f3af9f" },
  { label: "Bright Orange", hex: "#f08c00" },
  { label: "Light Orange", hex: "#eec07c" },
  { label: "Bright Yellow", hex: "#e3ec31" },
  { label: "Light Yellow", hex: "#f6f69f" },
  { label: "White", hex: "#ffffff" },
  { label: "Gray", hex: "#e4e5e6" },
  { label: "Black", hex: "#3a3a3a" },
  { label: "Transparent", hex: "#ffffff" },
];

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

export const layouts = [
  { label: "1:1", aspect: 1, size: { width: 3840, height: 3840 } },
  { label: "9:16", aspect: 9 / 16, size: { width: 2160, height: 3840 } },
  { label: "16:9", aspect: 16 / 9, size: { width: 3840, height: 2160 } },
  { label: "4:3", aspect: 4 / 3, size: { width: 3840, height: 2880 } },
  { label: "Custom", aspect: 1, size: { width: 500, height: 500 } },
];

export const textPalette: ColorInfo[] = [
  { label: "White", hex: "#ffffff" },
  { label: "Black", hex: "#3a3a3a" },
];

export const textSettings = {
  enabled: false,
  layout: "Layout 1",
  title: "This is a title",
  titleSize: 5,
  body: "This is body text",
  bodySize: 3,
  color: textPalette[0],
};

export const exportFormats = [
  { label: "PNG", type: "image/png", ext: "png" },
  { label: "MP4", type: "video/mp4", ext: "mp4" },
];

export const exportSettings = {
  ffmpegLoaded: false,
  format: exportFormats[0],
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
