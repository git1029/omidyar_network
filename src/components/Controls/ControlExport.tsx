import { MutableRefObject } from "react";
import useStore from "../../store/store";

import { exportFormats } from "../../store/options";
import { ExportFormat } from "../../types";
import { ExportObject } from "../Scene";

import ControlGroup from "./ControlGroup";
import Toggle from "../Core/Toggle";

const ControlExport = ({
  ffmpeg,
}: {
  ffmpeg: MutableRefObject<ExportObject | null>;
}) => {
  const download = async () => {
    if (ffmpeg.current) await ffmpeg.current.download();
  };

  const exportSettings = useStore((state) => state.exportSettings);
  const setValue = useStore((state) => state.setValue);

  const handleFormatChange = <T,>(value: T) => {
    const match = exportFormats.find((format) => format === value);
    if (match) {
      setValue("exportSettings", { ...exportSettings, format: match });
    }
  };

  const exportToggle = {
    label: "Format",
    options: exportFormats,
    value: exportSettings.format,
    onChange: handleFormatChange,
  };

  return (
    <ControlGroup title="Export">
      <Toggle<ExportFormat> {...exportToggle} />
      <button className="mt-2" onClick={download}>
        Export
      </button>
    </ControlGroup>
  );
};

export default ControlExport;
