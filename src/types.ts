export interface Layout {
  label: string;
  aspect: number;
  size: { width: number; height: number };
}

export interface ColorInfo {
  label: string;
  hex: string;
}

export interface InputMode {
  label: string;
  value: number;
  file?: boolean;
  accepts?: string[];
}

export interface TextSettings {
  enabled: boolean;
  layout: string;
  title: string;
  titleSize: number;
  body: string;
  bodySize: number;
  color: ColorInfo;
}

export interface Upload {
  name: string;
  url: string;
  type: string;
}

interface ExportFormat {
  label: string;
  type: string;
  ext: string;
  typeRoot: string;
}

export interface ExportSettings {
  ffmpegLoaded: boolean;
  format: ExportFormat;
  exporting: boolean;
}

export type TextAlign = "center" | "left" | "right" | "justify" | undefined;

type ModalType = "message" | "warning" | "error";

export interface Modal {
  title: string;
  progress?: {
    value?: number;
    status?: string;
  };
  description?: string;
  type: ModalType;
}
