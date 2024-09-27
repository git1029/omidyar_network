import { patternSettings } from "../../store/options";
import useStore from "../../store/store";

import ControlGroup from "./ControlGroup";
import Slider from "../Core/Slider";
// import Control from "../Core/Control";

const Pattern = () => {
  const patternRef = useStore((state) => state.patternRef);

  const patternSliders = [
    {
      label: "Dot Size",
      defaultValue: patternSettings.patternDotSize,
      onChange: (value: number) => {
        if (patternRef) {
          patternRef.uniforms.uDotSize.value = value;
        }
      },
    },
    {
      label: "Contrast",
      defaultValue: patternSettings.patternContrast,
      onChange: (value: number) => {
        if (patternRef) {
          patternRef.uniforms.uInputContrast.value = value;
        }
      },
    },
  ];

  return (
    <ControlGroup title="Pattern Control">
      {patternSliders.map((s) => (
        <Slider key={s.label} {...s} />
      ))}

      {/* <Control label="3D">
        <div>On Off</div>
      </Control>

      <Control label="Option">
        <select>
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
        </select>
      </Control> */}
    </ControlGroup>
  );
};

export default Pattern;
