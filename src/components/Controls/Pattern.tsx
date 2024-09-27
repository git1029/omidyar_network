import { patternEffectOptions, patternSettings } from "../../store/options";
import useStore from "../../store/store";

import ControlGroup from "./ControlGroup";
import Slider from "../Core/Slider";
import Toggle from "../Core/Toggle";
import Control from "../Core/Control";
import { useState } from "react";
// import Control from "../Core/Control";

const Pattern = () => {
  const patternRef = useStore((state) => state.patternRef);
  const effectRef = useStore((state) => state.effectRef);

  const [effectMode, setEffectMode] = useState(patternEffectOptions.enabled[0]);

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

  const handlePatternEffectChange = <T,>(value: T) => {
    if (setEffectMode === value) return;
    const match = patternEffectOptions.enabled.find((o) => o === value);
    if (match) {
      setEffectMode(match);
      if (effectRef) {
        effectRef.uniforms.uEffect.value.x = match.value;
      }
      if (patternRef) {
        patternRef.uniforms.uEffect.value.x = match.value;
      }
    }
  };

  const patternEffectToggleProps = {
    label: "3D Effect",
    options: patternEffectOptions.enabled,
    value: effectMode,
    onChange: handlePatternEffectChange,
  };

  return (
    <ControlGroup title="Pattern Control">
      {patternSliders.map((s) => (
        <Slider key={s.label} {...s} />
      ))}

      <Toggle {...patternEffectToggleProps} />

      <div className={effectMode.value === 1 ? "flex" : "hidden"}>
        <Control label="Effect Style">
          <select>
            <option>Style 1</option>
            <option>Style 2</option>
            <option>Style 3</option>
          </select>
        </Control>
      </div>
    </ControlGroup>
  );
};

export default Pattern;
