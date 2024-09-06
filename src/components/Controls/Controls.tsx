// import { ReactNode } from "react";
// import { colors } from "../../store/options";
// import Slider from "../Slider";
import ControlGroup from "./ControlGroup";
import ControlColor from "./ControlColor";
import ControlGrid from "./ControlGrid";
import ControlPattern from "./ControlPattern";
import ControlInput from "./ControlInput";

const Controls = () => {
  return (
    <div className="w-[40%]">
      <div className="flex flex-col gap-y-6 max-w-[550px]">
        <h1 className="font-[TestFeijoaDisplay]">Omidyar Network</h1>
        <ControlInput />
        <ControlGroup>
          <h2>Ratio</h2>
          <select>
            <option>1:1</option>
            <option>16:9</option>
            <option>9:16</option>
            <option>4:5</option>
            <option>Custom</option>
          </select>
        </ControlGroup>

        <ControlGrid />
        <ControlPattern />
        <ControlColor />

        <ControlGroup>
          <h2>Export</h2>
          <select>
            <option>PNG</option>
            <option>MP4</option>
          </select>
        </ControlGroup>
      </div>
    </div>
  );
};

export default Controls;
