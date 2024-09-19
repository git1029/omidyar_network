import ControlGroup from "./ControlGroup";
import { palette } from "../../store/options";
import useStore from "../../store/store";
import { useEffect, useState } from "react";
// import { useShallow } from "zustand/react/shallow";
// import IconTransparent from "/icon_transparent.svg";
import ColorIcon from "./ColorIcon";
import { ColorInfo } from "../../types";
import TransparentPattern from "/transparent.png";
import TransparentPattern2 from "/transparent2.png";

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
  const inputBackground = useStore((state) => state.inputBackground);
  const canvasRef = useStore.getState().canvasRef;

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

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--background-color",
      backgroundColor.rgb.join(" ")
    );
    document.documentElement.style.setProperty(
      "--foreground-color",
      backgroundColor.rgbContrast.join(" ")
    );
  }, [backgroundColor]);

  useEffect(() => {
    if (canvasRef) {
      if (backgroundColor.label === "Transparent") {
        canvasRef.style.background = `url(${
          nodeColor.label === "Black" ? TransparentPattern : TransparentPattern2
        }) repeat center`;
      } else {
        canvasRef.style.removeProperty("background");
      }
    }
  }, [nodeColor, backgroundColor, canvasRef]);

  useEffect(() => {
    if (inputBackground) {
      const bg = palette.find((p) => p.label === nodeColor.pair);
      // console.log(bg, nodeColor.pair);
      if (bg) {
        document.documentElement.style.setProperty(
          "--background-color",
          bg.rgb.join(" ")
        );

        setBackgroundColor(bg);
      }

      // document.documentElement.style.setProperty(
      //   "--foreground-color",
      //   nodeColor.rgbContrast.join(" ")
      // );
    }
  }, [nodeColor, inputBackground]);

  const handleColorSelect = (mode: string, color: ColorInfo) => {
    if (mode === "Background") {
      setBackgroundColor(color);
      const foregroundMatch = palette.find((p) => p.pair === color.label);
      if (foregroundMatch) {
        setNodeColor(foregroundMatch);
      }
    }

    if (mode === "Foreground") setNodeColor(color);

    // if (canvasContainerRef) {
    //   if (mode === "Background")
    //     if (color.label === "Transparent" || color.label === "Gray") {
    //       canvasContainerRef.style.borderColor = "#3a3a3a";
    //     } else {
    //       canvasContainerRef.style.borderColor = "transparent";
    //     }
    // }
  };

  useEffect(() => {
    if (patternRef) {
      if (backgroundColor.label === "Transparent") {
        patternRef.uniforms.uAlpha.value = 0;
      } else {
        patternRef.uniforms.uAlpha.value = 1;
      }

      patternRef.uniforms.uBackgroundColor.value.set(backgroundColor.hex);
      patternRef.uniforms.uForegroundColor.value.set(nodeColor.hex);
    }
  }, [backgroundColor, nodeColor, patternRef]);

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

  const optionsFiltered = options.filter(
    (o) => !(inputBackground && o.label === "Background")
  );

  const neutrals = ["Gray", "White", "Black", "Transparent"];
  let foregroundColors = neutrals.filter((c) => c !== "Transparent");
  if (neutrals.includes(backgroundColor.label)) {
    foregroundColors = palette
      .map((c) => c.label)
      .filter((c) => c !== "Transparent")
      .filter((c) => c !== backgroundColor.label);
  }
  if (inputBackground) {
    foregroundColors = palette
      .map((c) => c.label)
      .filter((c) => c !== "Transparent");
  }
  if (!inputBackground && backgroundColor.pair)
    foregroundColors.push(backgroundColor.pair);

  return (
    <ControlGroup title="Color">
      {optionsFiltered.map((color) => (
        <div key={color.label} className="flex flex-col gap-y-1">
          <label>{color.label}</label>
          <div className="flex gap-x-0.5 p-1 border border-foreground/50 rounded-md w-fit">
            {palette.map((c) => {
              if (
                color.label === "Foreground" &&
                !foregroundColors.includes(c.label)
              )
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
      {backgroundColor.label !== "Transparent" && !inputBackground && (
        <button
          className="mt-2"
          disabled={backgroundColor.label === "Transparent"}
          onClick={handleColorSwap}
        >
          Swap Colors
        </button>
      )}
    </ControlGroup>
  );
};

export default ControlColor;
