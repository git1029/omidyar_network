import ControlGroup from "../Core/ControlGroup";
import {
  backgroundEffectOptions,
  inputBackgroundOptions,
  inputModes,
  invertOptions,
} from "../../store/options";
import useStore from "../../store/store";
import ControlInputText from "./ControlInputText";
import ControlInputMedia from "./ControlInputMedia";
import ControlInputCamera from "./ControlInputCamera";
import { useEffect, useState } from "react";
import { BackgroundEffectSetting, InputMode } from "../../types";
import Toggle from "../Core/Toggle";
import Capture from "./Capture";

const ControlInput = () => {
  const inputMode = useStore((state) => state.inputMode);
  const patternRef = useStore((state) => state.patternRef);
  const backgroundRef = useStore((state) => state.backgroundRef);
  const effectRef = useStore((state) => state.effectRef);
  const inputBackground = useStore((state) => state.inputBackground);
  const setValue = useStore((state) => state.setValue);
  const backgroundEffect = useStore((state) => state.backgroundEffect);

  const [inverted, setInverted] = useState(invertOptions[0]);

  useEffect(() => {
    if (patternRef) {
      patternRef.uniforms.uMode.value = inputMode.value;
    }
    if (backgroundRef) {
      backgroundRef.uniforms.uMode.value = inputMode.value;
    }
    if (effectRef) {
      effectRef.uniforms.uMode.value = inputMode.value;
    }
  }, [inputMode, patternRef, backgroundRef, effectRef]);

  const handleInputModeChange = <T,>(value: T) => {
    if (inputMode === value) return;
    const match = inputModes.find((m) => m === value);
    if (match) {
      setValue("inputMode", match);
    }
  };

  const handleInvert = <T,>(value: T) => {
    if (value === inverted) return;
    const match = invertOptions.find((o) => o === value);
    if (match) {
      setInverted(match);
      if (patternRef) {
        patternRef.uniforms.uInvert.value = match.value;
      }
    }
  };

  const handleInputBackgroundChange = <T,>(value: T) => {
    if (inputBackground === value) return;
    const match = inputBackgroundOptions.find((o) => o === value);
    if (match) {
      setValue("inputBackground", match);
      if (patternRef) {
        patternRef.uniforms.uInputBackground.value = match.value;
      }
      if (backgroundRef) {
        backgroundRef.uniforms.uInputBackground.value = match.value;
      }
      if (effectRef) {
        effectRef.uniforms.uInputBackground.value = match.value;
      }
    }
  };

  const handleBackgroundEffectChange = <T,>(value: T) => {
    if (backgroundEffect === value) return;
    const match = backgroundEffectOptions.find((o) => o === value);
    if (match) {
      setValue("backgroundEffect", match);
      if (effectRef) {
        effectRef.uniforms.uBackgroundEffect.value = match.value;
      }
      if (patternRef) {
        patternRef.uniforms.uBackgroundEffect.value = match.value;
      }
    }
  };

  const inputToggle = {
    label: "Mode",
    options: inputModes,
    value: inputMode,
    onChange: handleInputModeChange,
  };

  const invertToggle = {
    label: "Invert",
    options: invertOptions,
    value: inverted,
    onChange: handleInvert,
  };

  const inputBackgroundToggle = {
    label: "Use as background",
    options: inputBackgroundOptions,
    value: inputBackground,
    onChange: handleInputBackgroundChange,
  };

  const backgroundEffectToggle = {
    label: "Background Effect",
    value: backgroundEffect,
    options: backgroundEffectOptions,
    onChange: handleBackgroundEffectChange,
  };

  return (
    <>
      <ControlGroup title="Upload">
        <Toggle<InputMode> {...inputToggle} />

        <div className="flex flex-col gap-y-1">
          <label>{inputMode.label} Input</label>
          <div className="flex flex-col">
            <ControlInputCamera />
            <ControlInputText />
            <ControlInputMedia />
          </div>
        </div>

        <Capture />
        <Toggle {...invertToggle} />
        {inputMode.value !== 3 && <Toggle {...inputBackgroundToggle} />}
        {inputMode.value !== 3 && inputBackground.value === 1 && (
          <Toggle<BackgroundEffectSetting> {...backgroundEffectToggle} />
        )}
      </ControlGroup>
    </>
  );
};

export default ControlInput;
