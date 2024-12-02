import { Color } from "three";
import {
  ColorInfo,
  ExportFormat,
  InputMode,
  Layout,
  LogoOption,
  TextLayout,
  TextSettings,
} from "../types";

import DefaultImage from "/img.jpg";
import DefaultVideo from "/footage.mp4";

import IconArrowX from "/icon_arrow_x.svg";
import IconArrowY from "/icon_arrow_y.svg";
import IconArrowDiag1 from "/icon_arrow_diag_1.svg";
import IconArrowDiag2 from "/icon_arrow_diag_2.svg";

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

export const gridSettingsDefault = {
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

export const textModeOptions = [
  { label: "Off", value: 0 },
  { label: "Static", value: 1 },
  { label: "Animation", value: 2 },
];

export const textSettings: TextSettings = {
  mode: textModeOptions[0],
  layout: textLayoutOptions[0],
  title: "Shaping\nTomorrow",
  titleSize: 5,
  color: textPalette[0],
  animating: false,
  animationSpeed: 0.3333,
  animationScale: 0,
};

export const exportFormats: ExportFormat[] = [
  { label: "PNG", type: "image/png", ext: "png", typeRoot: "image" },
  {
    label: "PNG Sequence",
    type: "image/png",
    ext: "png",
    sequence: true,
    typeRoot: "image",
    modes: [1, 2],
  },
  {
    label: "MP4",
    type: "video/mp4",
    ext: "mp4",
    typeRoot: "video",
    modes: [1, 2],
  },
];

export const exportSettings = {
  // ffmpegLoaded: false,
  enabled: true,
  format: exportFormats[0],
  exporting: false,
};

export const logoOptions: LogoOption[] = [
  { label: "Off", value: 0 },
  { label: "Full Logo", value: 1 },
  { label: "Emblem Only", value: 2 },
];

export const inputBackgroundOptions = [
  { label: "Off", value: 0 },
  { label: "On", value: 1 },
];

export const invertOptions = [
  { label: "Off", value: 0 },
  { label: "On", value: 1 },
];

export const gridOptions = [
  {
    label: "Square",
    value: 0,
  },
  {
    label: "Isometric",
    value: 1,
  },
];

export const connectorOptions = [
  { label: "A", icon: [IconArrowX, IconArrowDiag1] },
  { label: "B", icon: [IconArrowY, IconArrowDiag2] },
];

export const patternEffectOptions = {
  modes: [
    { label: "Off", value: 0 },
    { label: "On", value: 1 },
  ],
  styles: [
    { label: "Style 1", value: 0 },
    { label: "Style 2", value: 1 },
    { label: "Style 3", value: 2 },
    { label: "Style 4", value: 3 },
  ],
};

export const backgroundEffectOptions = [
  { label: "Off", value: 0 },
  { label: "Displacement", value: 1 },
  { label: "Blur", value: 2 },
];

export const defaultUpload = {
  image: {
    name: "img.jpg",
    url: DefaultImage,
    type: "image/jpg",
  },
  video: {
    name: "footage.mp4",
    url: DefaultVideo,
    type: "video/mp4",
  },
};
