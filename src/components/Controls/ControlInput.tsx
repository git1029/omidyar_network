// import { useEffect, useRef, useState } from "react";
import ControlGroup from "./ControlGroup";
// import { TextureLoader } from "three";
import { inputModes } from "../../store/options";
import useStore from "../../store/store";
// import useCamera from "../../helpers/useCamera";
import ControlInputText from "./ControlInputText";
import ControlInputMedia from "./ControlInputMedia";
import ControlInputCamera from "./ControlInputCamera";
import { useEffect, useState } from "react";
import Toggle from "./Toggle";

const ControlInput = () => {
  const inputMode = useStore((state) => state.inputMode);
  const setInputMode = useStore((state) => state.setInputMode);
  const patternRef = useStore((state) => state.patternRef);

  const [inverted, setInverted] = useState("Off");

  const inputBackground = useStore((state) => state.inputBackground);
  const setInputBackground = useStore((state) => state.setInputBackground);

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

  const handleInputModeChange = (label: string) => {
    const match = inputModes.find((m) => m.label === label);
    if (match) {
      setInputMode(match);
    }
  };

  const handleInvert = (label: string) => {
    if (label === inverted) return;
    setInverted(label);
    if (patternRef) {
      patternRef.uniforms.uInvert.value = label === "On" ? 1 : 0;
    }
  };

  const handleInputBackground = (label: string) => {
    if (
      (label === "On" && inputBackground) ||
      (label === "Off" && !inputBackground)
    )
      return;
    setInputBackground(label === "On" ? true : false);
    if (patternRef) {
      patternRef.uniforms.uInputBackground.value = label === "On" ? 1 : 0;
    }
  };

  const inputToggle = {
    label: "Mode",
    options: inputModes.map((m) => ({ label: m.label })),
    onChange: handleInputModeChange,
    isSelected: (label: string) => inputMode.label === label,
  };

  const invertToggle = {
    label: "Invert",
    options: [{ label: "Off" }, { label: "On" }],
    onChange: handleInvert,
    isSelected: (label: string) => inverted === label,
  };

  const inputBackgroundToggle = {
    label: "Use as background",
    options: [{ label: "Off" }, { label: "On" }],
    onChange: handleInputBackground,
    isSelected: (label: string) =>
      (label === "On" && inputBackground) ||
      (label === "Off" && !inputBackground),
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

        <Toggle {...inputToggle} />

        <div className="flex flex-col gap-y-1">
          <label>Select File</label>
          <div className="flex flex-col">
            <ControlInputCamera inverted={inverted === "On"} />
            <ControlInputText inverted={inverted === "On"} />
            <ControlInputMedia inverted={inverted === "On"} />

            {/* <div className="flex items-center mt-2">
              <div className="flex items-center grow gap-x-2"> */}
            {/* <button onClick={handleInvert}>Invert Color</button> */}
            {/* </div>
            </div> */}
          </div>
        </div>

        <Toggle {...invertToggle} />
        {inputMode.value !== 3 && <Toggle {...inputBackgroundToggle} />}
      </ControlGroup>
    </>
  );
};

export default ControlInput;
