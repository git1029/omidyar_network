import { useEffect } from "react";
import useStore from "../../store/store";
import { palette } from "../../store/options";
import { ColorInfo } from "../../types";

import ControlGroup from "../Core/ControlGroup";
import ColorIcon from "./ColorIcon";

import TransparentPattern from "/transparent.png";
// import TransparentPattern2 from "/transparent2.png";

const Color = () => {
  // const [backgroundColor, setBackgroundColor] = useState(palette[0]);
  // const [foregroundColor, setNodeColor] = useState(palette[1]);

  const backgroundColor = useStore((state) => state.backgroundColor);
  const foregroundColor = useStore((state) => state.foregroundColor);
  const patternRef = useStore((state) => state.patternRef);
  const inputBackground = useStore((state) => state.inputBackground);
  const canvasRef = useStore.getState().canvasRef;
  const setValue = useStore((state) => state.setValue);

  const handleColorSwap = () => {
    if (backgroundColor.label === "Transparent") return;

    if (patternRef) {
      patternRef.uniforms.uBackgroundColor.value.set(foregroundColor.hex);
      patternRef.uniforms.uForegroundColor.value.set(backgroundColor.hex);
    }

    const bgColor = backgroundColor;
    setValue("backgroundColor", foregroundColor);
    setValue("foregroundColor", bgColor);
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
        // canvasRef.style.background = `url(${
        //   foregroundColor.label === "Black"
        //     ? TransparentPattern
        //     : TransparentPattern2
        // }) repeat center`;
        canvasRef.style.background = `url(${TransparentPattern}) repeat center`;
      } else {
        canvasRef.style.removeProperty("background");
      }
    }
  }, [foregroundColor, backgroundColor, canvasRef]);

  useEffect(() => {
    if (inputBackground.value) {
      const bg = palette.find((p) => p.label === foregroundColor.pair);
      // console.log(bg, foregroundColor.pair);
      if (bg) {
        document.documentElement.style.setProperty(
          "--background-color",
          bg.rgb.join(" ")
        );

        setValue("backgroundColor", bg);
      }

      // document.documentElement.style.setProperty(
      //   "--foreground-color",
      //   foregroundColor.rgbContrast.join(" ")
      // );
    }
  }, [foregroundColor, inputBackground, setValue]);

  const handleColorSelect = (mode: string, color: ColorInfo) => {
    if (mode === "Background" && backgroundColor !== color) {
      setValue("backgroundColor", color);
      const foregroundMatch = palette.find((p) => p.pair === color.label);
      if (foregroundMatch) {
        setValue("foregroundColor", foregroundMatch);
      }
    }

    if (mode === "Foreground" && foregroundColor !== color)
      setValue("foregroundColor", color);

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
      patternRef.uniforms.uForegroundColor.value.set(foregroundColor.hex);
    }
  }, [backgroundColor, foregroundColor, patternRef]);

  const options = [
    {
      label: "Background",
    },
    { label: "Foreground" },
  ];

  const isSelected = (color: string, label: string) => {
    if (
      (color === "Background" && label === backgroundColor.label) ||
      (color === "Foreground" && label === foregroundColor.label)
    )
      return true;

    return false;
  };

  // const transparent = () => {
  //   return <
  // }

  const optionsFiltered = options.filter(
    (o) => !(inputBackground.value && o.label === "Background")
  );

  const neutrals = ["Gray", "White", "Black", "Transparent"];
  let foregroundColors = neutrals.filter((c) => c !== "Transparent");
  if (neutrals.includes(backgroundColor.label)) {
    foregroundColors = palette
      .map((c) => c.label)
      .filter((c) => c !== "Transparent")
      .filter((c) => c !== backgroundColor.label);
  }
  if (inputBackground.value) {
    foregroundColors = palette
      .map((c) => c.label)
      .filter((c) => c !== "Transparent");
  }
  if (!inputBackground.value && backgroundColor.pair)
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
      {backgroundColor.label !== "Transparent" && !inputBackground.value && (
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

export default Color;
