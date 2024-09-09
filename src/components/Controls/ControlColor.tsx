import ControlGroup from "./ControlGroup";
import { palette } from "../../store/options";
import useStore from "../../store/store";
import { useState } from "react";
// import { useShallow } from "zustand/react/shallow";
// import IconTransparent from "/icon_transparent.svg";
import ColorIcon from "./ColorIcon";
import { ColorInfo } from "../../types";

const ControlColor = () => {
  // const [backgroundColor, setBackgroundColor, nodeColor, setNodeColor] =
  //   useStore(
  //     useShallow((state) => [
  //       state.backgroundColor,
  //       state.setBackgroundColor,
  //       state.nodeColor,
  //       state.setNodeColor,
  //     ])
  //   );

  const [backgroundColor, setBackgroundColor] = useState(palette[0]);
  const [nodeColor, setNodeColor] = useState(palette[1]);

  const patternRef = useStore((state) => state.patternRef);
  const canvasContainerRef = useStore((state) => state.canvasContainerRef);

  const handleColorSwap = () => {
    if (backgroundColor.label === "Transparent") return;

    if (patternRef) {
      patternRef.uniforms.uBackgroundColor.value.set(nodeColor.hex);
      patternRef.uniforms.uForegroundColor.value.set(backgroundColor.hex);
    }

    const bgColor = backgroundColor;
    setBackgroundColor(nodeColor);
    setNodeColor(bgColor);
  };

  const handleColorSelect = (mode: string, color: ColorInfo) => {
    if (mode === "Background") setBackgroundColor(color);
    if (mode === "Foreground") setNodeColor(color);

    if (canvasContainerRef) {
      if (mode === "Background")
        if (color.label === "Transparent" || color.label === "Gray") {
          canvasContainerRef.style.borderColor = "#3a3a3a";
        } else {
          canvasContainerRef.style.borderColor = "transparent";
        }
    }

    if (patternRef) {
      if (mode === "Background") {
        if (color.label === "Transparent") {
          patternRef.uniforms.uAlpha.value = 0;
        } else {
          patternRef.uniforms.uAlpha.value = 1;
        }
      }

      patternRef.uniforms[`u${mode}Color`].value.set(color.hex);
    }
  };

  const options = [
    {
      label: "Background",
    },
    { label: "Foreground" },
  ];

  const isSelected = (color: string, label: string) => {
    if (
      (color === "Background" && label === backgroundColor.label) ||
      (color === "Foreground" && label === nodeColor.label)
    )
      return true;

    return false;
  };

  // const transparent = () => {
  //   return <
  // }

  return (
    <ControlGroup>
      <h2>Color</h2>

      <div>
        {options.map((color) => (
          <div key={color.label} className="flex items-center">
            <label>{color.label}</label>
            <div className="flex gap-x-0.5">
              {palette.map((c) => {
                if (color.label === "Foreground" && c.label === "Transparent")
                  return null;

                const selected = isSelected(color.label, c.label);
                const onClick = () => handleColorSelect(color.label, c);

                return (
                  <ColorIcon
                    key={`color-${c.label}`}
                    color={c}
                    selected={selected}
                    onClick={onClick}
                  />
                );
              })}
            </div>
          </div>
        ))}
        {backgroundColor.label !== "Transparent" && (
          <div className="flex items-center mt-2">
            <label></label>
            <button
              disabled={backgroundColor.label === "Transparent"}
              onClick={handleColorSwap}
            >
              Swap Colors
            </button>
          </div>
        )}
      </div>
    </ControlGroup>
  );
};

export default ControlColor;
