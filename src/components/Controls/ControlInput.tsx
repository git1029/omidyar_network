// import { useEffect, useRef, useState } from "react";
import ControlGroup from "./ControlGroup";
// import { TextureLoader } from "three";
import { inputModes } from "../../store/options";
import useStore from "../../store/store";
// import useCamera from "../../helpers/useCamera";
import ControlInputText from "./ControlInputText";
import ControlInputMedia from "./ControlInputMedia";
import ControlInputCamera from "./ControlInputCamera";
import { useState } from "react";

const ControlInput = () => {
  const inputMode = useStore((state) => state.inputMode);
  const setInputMode = useStore((state) => state.setInputMode);
  const patternRef = useStore((state) => state.patternRef);

  const [inverted, setInverted] = useState(false);

  const handleInputModeChange = (mode: number) => {
    const match = inputModes.find((m) => m.value === mode);
    if (match) {
      setInputMode(match);

      if (patternRef) {
        patternRef.uniforms.uMode.value = match.value;
      }
    }
  };

  const handleInvert = () => {
    setInverted(!inverted);
    if (patternRef) {
      patternRef.uniforms.uInvert.value = 1 - patternRef.uniforms.uInvert.value;
    }
  };

  return (
    <>
      <ControlGroup title="Input" border={false}>
        <div className="flex items-center">
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
        </div>

        <div className="flex items-center">
          <label></label>
          <div className="flex flex-col">
            <ControlInputCamera inverted={inverted} />
            <ControlInputText inverted={inverted} />
            <ControlInputMedia inverted={inverted} />

            <div className="flex items-center mt-2">
              <div className="flex items-center grow gap-x-2">
                <button onClick={handleInvert}>Invert Color</button>
              </div>
            </div>
          </div>
        </div>
      </ControlGroup>
    </>
  );
};

export default ControlInput;
