// import { useState } from "react";
import ControlGroup from "./ControlGroup";
import useStore from "../../store/store";
import { textPalette, textSettings } from "../../store/options";
import ColorIcon from "./ColorIcon";
import Slider from "./Slider";
import { ColorInfo } from "../../types";

const ControlText = () => {
  const text = useStore((state) => state.text);
  const setText = useStore((state) => state.setText);

  const handleEnableText = () => {
    setText({ ...text, enabled: !text.enabled });
  };

  const handleColorChange = (c: ColorInfo) => {
    setText({ ...text, color: c });
  };

  const textSliders = {
    title: {
      label: "Title Size",
      defaultValue: textSettings.titleSize,
      normalized: false,
      min: 1,
      max: 10,
      onChange: (value: number) => {
        setText({ ...text, titleSize: value });
      },
    },
  };

  return (
    <ControlGroup>
      <div className="flex">
        <h2 className="w-[200px]">Text</h2>
        {/* <div className="h-8 flex border border-black-100 rounded-sm items-center">
          <div className="px-2 bg-transparent flex grow h-full items-center cursor-pointer">
            Hide
          </div>
          <div className="px-2 bg-white flex grow h-full items-center">
            Show
          </div>
        </div> */}
        <button onClick={handleEnableText}>
          {text.enabled ? "Hide" : "Show"} Text
        </button>
      </div>
      <div className={`flex-col gap-y-2 ${text.enabled ? "flex" : "hidden"}`}>
        <div className="flex items-center">
          <label>Layout</label>
          {/* <select>
            <option>Layout 1</option>
          </select> */}
          <div className="flex gap-x-1">
            <div className="border border-black-100 bg-white rounded-sm w-8 h-8 cursor-pointer"></div>
            <div className="border border-black-100 bg-transparent rounded-sm w-8 h-8"></div>
            <div className="border border-black-100 bg-transparent rounded-sm w-8 h-8"></div>
            <div className="border border-black-100 bg-transparent rounded-sm w-8 h-8"></div>
            <div className="border border-black-100 bg-transparent rounded-sm w-8 h-8"></div>
          </div>
        </div>
        <div className="flex items-center">
          <label>Title</label>
          <textarea
            rows={1}
            value={text.title}
            onChange={(e) => setText({ ...text, title: e.target.value })}
          />
        </div>
        <div>
          <Slider {...textSliders.title} />
        </div>
        <div className="flex items-center">
          <label>Body</label>
          <textarea
            rows={4}
            value={text.body}
            onChange={(e) => setText({ ...text, body: e.target.value })}
          />
        </div>

        <div className="flex items-center">
          <label>Text color</label>
          <div className="flex gap-x-0.5">
            {textPalette.map((c) => {
              // const selected = isSelected(color.label, c.label);
              // const onClick = () => handleColorSelect(color.label, c);
              if (c === undefined) return null;

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
        </div>
      </div>
    </ControlGroup>
  );
};

export default ControlText;
