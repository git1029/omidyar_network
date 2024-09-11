import ControlInput from "./ControlInput";
import ControlRatio from "./ControlRatio";
import ControlGrid from "./ControlGrid";
import ControlPattern from "./ControlPattern";
import ControlColor from "./ControlColor";
import ControlExport from "./ControlExport";
// import ControlText from "./ControlText";
import Logo from "/logo.svg";
import { ExportObject } from "../Scene";
import { MutableRefObject } from "react";

const ControlsHeader = () => {
  return (
    <div className="flex items-center gap-x-2 border-b border-black-100 pb-6 pl-8">
      <img src={Logo} className="w-14 h-14" />
      <h1 className="font-[TestFeijoaDisplay] ">Omidyar Network</h1>
    </div>
  );
};

const Controls = ({
  ffmpeg,
}: {
  ffmpeg: MutableRefObject<ExportObject | null>;
}) => {
  return (
    <div className="w-[630px] flex border-r border-black-100 pt-8">
      <div className="flex flex-col grow">
        <ControlsHeader />
        <div
          className="overflow-y-scroll h-full flex flex-col gap-y-6 pr-8 pl-8"
          style={{ scrollbarColor: "#c4c5c6 transparent" }}
        >
          <ControlInput />
          <ControlRatio />
          <ControlGrid />
          <ControlPattern />
          <ControlColor />
          {/* <ControlText /> */}
          <ControlExport ffmpeg={ffmpeg} />
        </div>
      </div>
    </div>
  );
};

export default Controls;
