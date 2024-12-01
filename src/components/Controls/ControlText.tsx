import ControlGroup from "../Core/ControlGroup";
import useStore from "../../store/store";
import {
  textLayoutOptions,
  textModeOptions,
  textPalette,
  textSettings,
} from "../../store/options";
import ColorIcon from "./ColorIcon";
import { ColorInfo, TextLayout } from "../../types";
import Control from "../Core/Control";
import { useEffect, useState } from "react";
import Slider from "../Core/Slider";
import Toggle from "../Core/Toggle";

const textBlendOptions = [
  { label: "Off", value: 0 },
  { label: "On", value: 1 },
];

const ControlText = () => {
  const text = useStore((state) => state.text);
  const backgroundColor = useStore((state) => state.backgroundColor);
  const foregroundColor = useStore((state) => state.foregroundColor);
  const backgroundEffect = useStore((state) => state.backgroundEffect);
  const setValue = useStore((state) => state.setValue);

  const [textBlend, setTextBlend] = useState(textBlendOptions[0]);

  const handleTextModeChange = <T,>(value: T) => {
    if (text.mode === value) return;
    const match = textModeOptions.find((o) => o === value);
    if (match) {
      setValue("text", { ...text, animating: match.value === 2, mode: match });
    }
  };

  const handleColorChange = (c: ColorInfo) => {
    setValue("text", { ...text, color: c });
  };

  const layoutIcons = [
    <div className="w-[22px] h-[22px] bg-contrast/15 flex flex-col rounded-sm p-1 justify-end">
      <div className="bg-contrast w-3 rounded-sm h-0.5"></div>
    </div>,
    <div className="w-[22px] h-[22px] bg-contrast/15 flex flex-col rounded-sm p-1 justify-between">
      <div className="bg-contrast w-3 rounded-sm h-0.5"></div>
      <div className="bg-contrast w-3 rounded-sm h-0.5 self-end"></div>
      <div className="bg-contrast w-3 rounded-sm h-0.5"></div>
      <div className="bg-contrast w-3 rounded-sm h-0.5 self-end"></div>
    </div>,
    <div className="w-[22px] h-[22px] bg-contrast/15 flex flex-col rounded-sm items-end p-1">
      <div className="bg-contrast w-3 rounded-sm h-0.5"></div>
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
      // step: 10,
      min: 0.5,
      max: 2,
      step: 0.1,
      onChange: (value: number) => {
        setValue("text", { ...text, animationSpeed: value });
      },
    },
    scale: {
      label: "Scale",
      defaultValue: textSettings.animationScale,
      min: 1,
      max: 2,
      step: 0.1,
      onChange: (value: number) => {
        setValue("text", { ...text, animationScale: value });
      },
    },
  };

  const modeToggleProps = {
    label: "Mode",
    options: textModeOptions,
    value: text.mode,
    onChange: handleTextModeChange,
  };

  const layoutToggleProps = {
    label: "Layout",
    options: textLayoutOptions,
    value: text.layout,
    onChange: handleTextLayoutChange,
    customIcons: layoutIcons,
  };

  const textBlendToggle = {
    label: "Pattern Overlay",
    options: textBlendOptions,
    value: textBlend,
    onChange: <T,>(value: T) => {
      if (textBlend === value) return;
      const match = textBlendOptions.find((o) => o === value);
      if (match) {
        setTextBlend(match);
        const effectRef = useStore.getState().effectRef;
        if (effectRef) {
          effectRef.uniforms.uBlendText.value = match.value;
        }
      }
    },
  };

  const textPaletteFiltered = textPalette.filter(
    (c) =>
      c !== backgroundColor &&
      c !== foregroundColor &&
      !(
        backgroundColor.label.includes("Yellow") &&
        ["White", "Gray"].includes(c.label)
      )
  );

  useEffect(() => {
    if (
      (textPaletteFiltered.length > 0 && text.color === backgroundColor) ||
      text.color === foregroundColor ||
      (backgroundColor.label.includes("Yellow") &&
        ["White", "Gray"].includes(text.color.label))
    ) {
      setValue("text", { ...text, color: textPaletteFiltered[0] });
    }
  }, [backgroundColor, foregroundColor, textPaletteFiltered, text, setValue]);

  return (
    <ControlGroup title="Text">
      <Toggle {...modeToggleProps} />

      <div
        className={`flex-col gap-y-3 ${
          text.mode.value > 0 ? "flex" : "hidden"
        }`}
      >
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
      </div>

      <Control label="Color">
        <div className="flex gap-x-0.5 p-1 border border-contrast/50 rounded-md w-fit">
          {textPaletteFiltered.map((c) => {
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

      {text.mode.value > 0 && backgroundEffect.value === 0 && (
        <Toggle {...textBlendToggle} />
      )}

      {text.mode.value === 2 && (
        <>
          <Control label="Animation">
            <button
              onClick={() =>
                setValue("text", { ...text, animating: !text.animating })
              }
            >
              {text.animating ? "Pause" : "Play"}
            </button>
          </Control>

          <Slider {...textSliders.speed} />
          <Slider {...textSliders.scale} />
        </>
      )}
    </ControlGroup>
  );
};

export default ControlText;
