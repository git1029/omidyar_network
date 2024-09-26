import { patternSettings } from "../../store/options";
import useStore from "../../store/store";

import ControlGroup from "./ControlGroup";
import Slider from "../Core/Slider";

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
    </ControlGroup>
  );
};

export default Pattern;
