import { MutableRefObject } from "react";
import ControlGroup from "./ControlGroup";
import { ExportObject } from "../Scene";
import { exportFormats } from "../../store/options";
import useStore from "../../store/store";
import Toggle from "./Toggle";

const ControlExport = ({
  ffmpeg,
}: {
  ffmpeg: MutableRefObject<ExportObject | null>;
}) => {
  const download = async () => {
    if (ffmpeg.current) await ffmpeg.current.download();
  };

  const exportSettings = useStore((state) => state.exportSettings);
  const setExportSettings = useStore((state) => state.setExportSettings);

  // const handleFormatChange = (e: ChangeEvent<HTMLSelectElement>) => {
  //   const value = e.target.value;
  //   const match = exportFormats.find((format) => format.type === value);
  //   if (match) {
  //     setExportSettings({ ...exportSettings, format: match });
  //   }
  // };

  const handleFormatChange = (label: string) => {
    const match = exportFormats.find((format) => format.label === label);
    if (match) {
      setExportSettings({ ...exportSettings, format: match });
    }
  };

  const exportToggle = {
    label: "Format",
    options: exportFormats.map((f) => ({ label: f.label })),
    onChange: handleFormatChange,
    isSelected: (label: string) => exportSettings.format.label === label,
  };

  return (
    <ControlGroup title="Export">
      {/* <div className="flex items-center">
        <label>Format</label>
        <select
          value={exportSettings.format.type}
          onChange={handleFormatChange}
        >
          {exportFormats.map((format) => (
            <option key={format.label} value={format.type}>
              {format.label}
            </option>
          ))}
        </select>
      </div> */}
      <Toggle {...exportToggle} />
      <button className="mt-2" onClick={download}>
        Export
      </button>
    </ControlGroup>
  );
};

export default ControlExport;
