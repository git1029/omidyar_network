export interface Layout {
  label: string;
  aspect: number;
  size: { width: number; height: number };
}

export interface ColorInfo {
  label: string;
  hex: string;
  contrast: string;
  rgb: number[];
  rgbContrast: number[];
  pair: string;
  type: string;
}

export interface InputMode {
  label: string;
  value: number;
  file?: boolean;
  accepts?: string[];
}

export interface TextLayout {
  label: string;
  value: number;
  icon?: string;
}

export interface TextSettings {
  mode: { label: string; value: number };
  layout: TextLayout;
  title: string;
  titleSize: number;
  color: ColorInfo;
  animating: boolean;
  animationSpeed: number;
  animationScale: number;
}

export interface Upload {
  name: string;
  url: string;
  type: string;
  width?: number;
  height?: number;
}

export interface LogoOption {
  label: string;
  value: number;
}

export interface ExportFormat {
  label: string;
  type: string;
  ext: string;
  typeRoot: string;
  modes?: number[];
  sequence?: boolean;
}

export interface ExportSettings {
  // ffmpegLoaded: boolean;
  format: ExportFormat;
  exporting: boolean;
  enabled: boolean;
  // duration: number;
}

export type TextAlign = "center" | "left" | "right" | "justify" | undefined;

// type ModalType = "message" | "warning" | "error";

export interface Modal {
  title: string;
  description: string;
  progress?: number;
  status?: string;
  closeLabel?: string;
  closeOnClick?: () => void;
}

export interface EffectSettings {
  mode: {
    label: string;
    value: number;
  };
  style: {
    label: string;
    value: number;
  };
  animating: boolean;
}
