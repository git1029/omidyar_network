import { patternEffectOptions, patternSettings } from "../../store/options";
import useStore from "../../store/store";

import ControlGroup from "../Core/ControlGroup";
import Slider from "../Core/Slider";
import Toggle from "../Core/Toggle";
import Control from "../Core/Control";
import { ChangeEvent } from "react";
// import Control from "../Core/Control";

const ControlPattern = () => {
  const patternRef = useStore((state) => state.patternRef);
  const effectRef = useStore((state) => state.effectRef);
  const patternEffect = useStore((state) => state.patternEffect);
  const setValue = useStore((state) => state.setValue);

  // const [effectPaused, setEffectPaused] = useState(false);
  // const [effectMode, setEffectMode] = useState(patternEffectOptions.enabled[0]);
  // const [effectStyle, setEffectStyle] = useState(
  //   patternEffectOptions.styles[0]
  // );

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
    if (patternEffect.mode === value) return;
    const match = patternEffectOptions.modes.find((o) => o === value);
    if (match) {
      setValue("patternEffect", { ...patternEffect, mode: match });
      if (effectRef) {
        effectRef.uniforms.uEffect.value.x = match.value;
        effectRef.uniforms.uTime.value = 0;
      }
    }
  };

  const patternEffectToggleProps = {
    label: "3D Effect",
    options: patternEffectOptions.modes,
    value: patternEffect.mode,
    onChange: handlePatternEffectChange,
  };

  const handleEffectPlayback = () => {
    setValue("patternEffect", {
      ...patternEffect,
      animating: !patternEffect.animating,
    });
    // if (effectRef) {
    //   effectRef.uniforms.uEffect.value.z = !effectPaused ? 0 : 1;
    // }
  };

  const handleEffectStyleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (patternEffect.style.value === Number(e.target.value)) return;
    const match = patternEffectOptions.styles.find(
      (o) => o.value === Number(e.target.value)
    );
    if (match) {
      setValue("patternEffect", {
        ...patternEffect,
        style: match,
        animating: true,
      });
      // setEffectStyle(match);
      // setEffectPaused(false);
      if (effectRef) {
        effectRef.uniforms.uEffect.value.y = match.value;
        // effectRef.uniforms.uEffect.value.z = 1;
        effectRef.uniforms.uTime.value = 0;
      }
    }
  };

  return (
    <ControlGroup title="Pattern Control">
      {patternSliders.map((s) => (
        <Slider key={s.label} {...s} />
      ))}

      <Toggle {...patternEffectToggleProps} />

      <div
        className={
          patternEffect.mode.value === 1 ? "flex flex-col gap-y-2" : "hidden"
        }
      >
        <Control label="Effect Style">
          <select
            value={patternEffect.style.value}
            onChange={handleEffectStyleChange}
          >
            {patternEffectOptions.styles.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Control>

        <Control>
          <button onClick={handleEffectPlayback}>
            {patternEffect.animating ? "Pause" : "Play"}
          </button>
        </Control>
      </div>
    </ControlGroup>
  );
};

export default ControlPattern;
