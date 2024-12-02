import { MutableRefObject, useEffect } from "react";
import useStore from "../../store/store";

import { exportFormats } from "../../store/options";
import { ExportFormat } from "../../types";
import { ExportObject } from "../Scene";

import ControlGroup from "../Core/ControlGroup";
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
  const ffmpegLoaded = useStore((state) => state.ffmpegLoaded);
  const inputMode = useStore((state) => state.inputMode);
  const cameraStatus = useStore((state) => state.cameraStatus);
  const setValue = useStore((state) => state.setValue);
  const text = useStore((state) => state.text);
  const patternEffect = useStore((state) => state.patternEffect);

  const exportFormatsFiltered = exportFormats.filter((f) => {
    if (inputMode.value !== 1) {
      if (f.label === "PNG") return true;
      else if (
        (text.mode.value === 2 && text.animating) ||
        (patternEffect.mode.value === 1 && patternEffect.animating)
      )
        return true;
    } else {
      return true;
    }

    return false;
  });

  const handleFormatChange = <T,>(value: T) => {
    if (exportSettings.format === value) return;
    const match = exportFormats.find((format) => format === value);
    if (match) {
      setValue("exportSettings", { ...exportSettings, format: match });
    }
  };

  useEffect(() => {
    if (!exportFormatsFiltered.includes(exportSettings.format)) {
      setValue("exportSettings", {
        ...exportSettings,
        format: exportFormatsFiltered[0],
      });
    }
  }, [exportFormatsFiltered, exportSettings, setValue, inputMode]);

  const exportToggle = {
    label: "Format",
    options: exportFormatsFiltered,
    value: exportSettings.format,
    onChange: handleFormatChange,
  };

  const message = () => {
    if (!ffmpegLoaded) return <div>Loading FFMPEG...</div>;
    if (inputMode.value === 2) {
      if (cameraStatus === 1) return <div>Loading camera input...</div>;
      if (cameraStatus === 0) return <div>Please check camera input</div>;
    }
    return null;
  };

  const cameraEnabled = !(inputMode.value === 2 && cameraStatus !== 2);

  if (!exportSettings.enabled) return null;

  return (
    <ControlGroup title="Export">
      {message()}
      {ffmpegLoaded && cameraEnabled && (
        <>
          <Toggle<ExportFormat> {...exportToggle} />
          {exportFormatsFiltered.length > 0 && (
            <button className="mt-2" onClick={download}>
              Export
            </button>
          )}
        </>
      )}
    </ControlGroup>
  );
};

export default ControlExport;
