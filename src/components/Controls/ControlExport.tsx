import { ChangeEvent, MutableRefObject } from "react";
import ControlGroup from "./ControlGroup";
import { ExportObject } from "../Scene";
import { exportFormats } from "../../store/options";
import useStore from "../../store/store";

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

  const handleFormatChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const match = exportFormats.find((format) => format.type === value);
    if (match) {
      setExportSettings({ ...exportSettings, format: match });
    }
  };

  return (
    <ControlGroup className="pb-20">
      <h2>Export</h2>
      <div className="flex items-center">
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
      </div>
      <div className="flex items-center">
        <label></label>
        <button onClick={download}>Export</button>
      </div>
    </ControlGroup>
  );
};

export default ControlExport;
