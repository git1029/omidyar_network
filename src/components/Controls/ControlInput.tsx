// import { useEffect, useRef, useState } from "react";
import ControlGroup from "./ControlGroup";
// import { TextureLoader } from "three";
import {
  inputBackgroundOptions,
  inputModes,
  invertOptions,
} from "../../store/options";
import useStore from "../../store/store";
// import useCamera from "../../helpers/useCamera";
import ControlInputText from "./ControlInputText";
import ControlInputMedia from "./ControlInputMedia";
import ControlInputCamera from "./ControlInputCamera";
import { useEffect, useState } from "react";
import { InputMode } from "../../types";
import Toggle from "../Core/Toggle";

const ControlInput = () => {
  const inputMode = useStore((state) => state.inputMode);
  const patternRef = useStore((state) => state.patternRef);

  const [inverted, setInverted] = useState(invertOptions[0]);

  const inputBackground = useStore((state) => state.inputBackground);
  const setValue = useStore((state) => state.setValue);

  // const handleInputModeChange = (mode: number) => {
  //   const match = inputModes.find((m) => m.value === mode);
  //   if (match) {
  //     setInputMode(match);

  //     if (patternRef) {
  //       patternRef.uniforms.uMode.value = match.value;
  //     }
  //   }
  // };

  useEffect(() => {
    if (patternRef) {
      patternRef.uniforms.uMode.value = inputMode.value;
    }
  }, [inputMode, patternRef]);

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
        patternRef.uniforms.uInputBackground.value = match.value ? 1 : 0;
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
    // isSelected: (label: string) => inverted === label,
  };

  const inputBackgroundToggle = {
    label: "Use as background",
    options: inputBackgroundOptions,
    value: inputBackground,
    onChange: handleInputBackgroundChange,
  };

  return (
    <>
      <ControlGroup title="Upload" border={false}>
        {/* <div className="flex items-center">
          <label>Input Mode</label>

          <select
            value={inputMode.value}
            onChange={(e) => handleInputModeChange(Number(e.target.value))}
          >
            {inputModes.map((mode) => (
              <option key={mode.label} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div> */}

        <Toggle<InputMode> {...inputToggle} />

        <div className="flex flex-col gap-y-1">
          <label>Select File</label>
          <div className="flex flex-col">
            <ControlInputCamera inverted={inverted.label === "On"} />
            <ControlInputText inverted={inverted.label === "On"} />
            <ControlInputMedia inverted={inverted.label === "On"} />

            {/* <div className="flex items-center mt-2">
              <div className="flex items-center grow gap-x-2"> */}
            {/* <button onClick={handleInvert}>Invert Color</button> */}
            {/* </div>
            </div> */}
          </div>
        </div>

        {/* <div className="flex gap-x-1">
          <button>Capture Image</button>
          <button>Capture Video</button>
        </div> */}

        <Toggle {...invertToggle} />
        {inputMode.value !== 3 && <Toggle {...inputBackgroundToggle} />}
      </ControlGroup>
    </>
  );
};

export default ControlInput;
