// import { useState } from "react";
import ControlGroup from "./ControlGroup";
import useStore from "../../store/store";
import {
  textLayoutOptions,
  textPalette,
  textSettings,
} from "../../store/options";
import ColorIcon from "./ColorIcon";
// import Slider from "../Core/Slider";
import { ColorInfo, TextLayout } from "../../types";
import Control from "../Core/Control";
import { useEffect } from "react";
import Slider from "../Core/Slider";
import Toggle from "../Core/Toggle";

const ControlText = () => {
  const text = useStore((state) => state.text);

  const backgroundColor = useStore((state) => state.backgroundColor);
  const foregroundColor = useStore((state) => state.foregroundColor);
  const logo = useStore((state) => state.logo);

  // const backgroundColor = useStore((state) => state.bac);
  const setValue = useStore((state) => state.setValue);

  const handleEnableText = () => {
    setValue("text", { ...text, enabled: !text.enabled });
  };

  const handleColorChange = (c: ColorInfo) => {
    setValue("text", { ...text, color: c });
  };

  const layoutIcons = [
    <div className="w-[22px] h-[22px] bg-foreground/15 flex flex-col rounded-sm p-1 justify-end">
      <div className="bg-foreground w-3 rounded-sm h-0.5"></div>
    </div>,
    <div className="w-[22px] h-[22px] bg-foreground/15 flex flex-col rounded-sm p-1 justify-between">
      <div className="bg-foreground w-3 rounded-sm h-0.5"></div>
      <div className="bg-foreground w-3 rounded-sm h-0.5 self-end"></div>
      <div className="bg-foreground w-3 rounded-sm h-0.5"></div>
      <div className="bg-foreground w-3 rounded-sm h-0.5 self-end"></div>
    </div>,
    <div className="w-[22px] h-[22px] bg-foreground/15 flex flex-col rounded-sm items-end p-1">
      <div className="bg-foreground w-3 rounded-sm h-0.5"></div>
    </div>,
  ];

  const handleTextLayoutChange = <T,>(value: T) => {
    if (value === text.layout) return;
    const match = textLayoutOptions.find((o) => o === value);
    if (match) {
      setValue("text", { ...text, layout: match });
    }
  };

  const textSliders = {
    speed: {
      label: "Speed",
      defaultValue: textSettings.animationSpeed,
      step: 10,
      onChange: (value: number) => {
        setValue("text", { ...text, animationSpeed: value });
      },
    },
    scale: {
      label: "Scale",
      defaultValue: textSettings.animationScale,
      step: 10,
      onChange: (value: number) => {
        setValue("text", { ...text, animationScale: value });
      },
    },
  };

  const layoutToggleProps = {
    label: "Layout",
    options: textLayoutOptions,
    value: text.layout,
    onChange: handleTextLayoutChange,
    customIcons: layoutIcons,
  };

  const textPaletteFiltered = textPalette.filter(
    (c) => c !== backgroundColor && c !== foregroundColor
  );

  useEffect(() => {
    if (
      (textPaletteFiltered.length > 0 && text.color === backgroundColor) ||
      text.color === foregroundColor
    ) {
      setValue("text", { ...text, color: textPaletteFiltered[0] });
    }
  }, [backgroundColor, foregroundColor, textPaletteFiltered, text, setValue]);

  return (
    <ControlGroup title="Text">
      <Control label="Enabled">
        <button onClick={handleEnableText}>
          {text.enabled ? "Hide" : "Show"} Text
        </button>
      </Control>

      {/* <div className={`flex-col gap-y-3 ${text.enabled ? "flex" : "hidden"}`}> */}
      <div className={`flex flex-col gap-y-3`}>
        <Toggle<TextLayout> {...layoutToggleProps} />

        <Control label="Title">
          <textarea
            rows={4}
            value={text.title}
            onChange={(e) =>
              setValue("text", { ...text, title: e.target.value })
            }
          />
        </Control>

        <Control label="Caption">
          <textarea
            rows={1}
            className="font-sans"
            onChange={(e) =>
              setValue("text", { ...text, caption: e.target.value })
            }
          ></textarea>
        </Control>

        <Control label="Logo">
          <button onClick={() => setValue("logo", !logo)}>
            {logo ? "Hide" : "Show"} Logo
          </button>
        </Control>

        <Control label="Color">
          <div className="flex gap-x-0.5 p-1 border border-foreground/50 rounded-md w-fit">
            {textPaletteFiltered.map((c) => {
              // const selected = isSelected(color.label, c.label);
              // const onClick = () => handleColorSelect(color.label, c);
              // if (c === undefined) return null;

              return (
                <ColorIcon
                  key={`color-${c.label}`}
                  color={c}
                  selected={text.color.label === c.label}
                  onClick={() => handleColorChange(c)}
                />
              );
            })}
          </div>
        </Control>

        <Control label="Animation">
          <button
            onClick={() =>
              setValue("text", { ...text, animating: !text.animating })
            }
          >
            {text.animating ? "Stop" : "Play"}
          </button>
        </Control>

        {/* <Control label="Speed"> */}
        <Slider {...textSliders.speed} />
        {/* <Slider {...textSliders.scale} /> */}
        {/* </Control> */}
      </div>
    </ControlGroup>
  );
};

export default ControlText;
