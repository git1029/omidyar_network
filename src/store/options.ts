// import { Vector2 } from "three";

export const colors = [
  "#5dc0a4",
  "#b5e2dd",
  "#8ba9f5",
  "#c9d2ff",
  "#a57ec9",
  "#cfbcea",
  "#df6651",
  "#f3af9f",
  "#f08c00",
  "#eec07c",
  "#e3ec31",
  "#f6f69f",
  "#ffffff",
  "#e4e5e6",
  "#3a3a3a",
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

export const inputModes = [
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

// export const layouts = [
//   { label: "16:9", size: { width: 3840, height: 2160 } },
//   { label: "4:3", size: { width: 3840, height: 2880 } },
//   { label: "1:1", size: { width: 3840, height: 3840 } },
//   { label: "9:16", size: { width: 2160, height: 3840 } },
// ];

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
