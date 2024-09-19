import { ChangeEvent, useState } from "react";
import { layouts } from "../../store/options";
import useStore from "../../store/store";
import ControlGroup from "./ControlGroup";
import ControlGrid from "./ControlGrid";
import Toggle from "./Toggle";

const ControlLayout = () => {
  const layout = useStore((state) => state.layout);
  const customLayout = useStore((state) => state.customLayout);
  const setLayout = useStore((state) => state.setLayout);
  const setCustomLayout = useStore((state) => state.setCustomLayout);

  // const handleLayoutChange = (e: ChangeEvent<HTMLSelectElement>) => {
  //   if (e.target.value === "Custom") setLayout(customLayout);
  //   else {
  //     const match = layouts.find((l) => l.label === e.target.value);
  //     if (match) {
  //       setLayout(match);
  //     }
  //   }
  // };

  const handleLayoutChange = (value: string) => {
    if (value === "Custom") setLayout(customLayout);
    else {
      const match = layouts.find((l) => l.label === value);
      if (match) {
        setLayout(match);
      }
    }
  };

  const handleCustomSize = () => {
    const newCustomLayout = {
      ...customLayout,
      aspect: customWidth / customHeight,
      size: { width: customWidth, height: customHeight },
    };

    setCustomLayout(newCustomLayout);
    setLayout(newCustomLayout);
  };

  const [customWidth, setCustomWidth] = useState(customLayout.size.width);
  const [customHeight, setCustomHeight] = useState(customLayout.size.height);

  const limit = { min: 320, max: 2000 };

  const isOutsideLimit = (width = false, height = false) => {
    const w = customWidth < limit.min || customWidth > limit.max;
    const h = customHeight < limit.min || customHeight > limit.max;

    if (width && !height) return w;
    else if (height && !width) return h;

    return w || h;
  };

  const isDisabled = () => {
    if (
      layout.label === "Custom" &&
      customWidth === layout.size.width &&
      customHeight === layout.size.height
    )
      return true;

    if (isOutsideLimit()) return true;

    return false;
  };

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const width = Number(e.target.value);
    setCustomWidth(width);
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const height = Number(e.target.value);
    setCustomHeight(height);
  };

  const handleWidthBlur = () => {
    if (customWidth < limit.min) {
      // setCustomWidth(limit.min);
    } else if (customWidth > limit.max) {
      // setCustomWidth(limit.max);
    } else {
      setCustomWidth(Math.floor(customWidth));
    }
  };

  const handleHeightBlur = () => {
    if (customHeight < limit.min) {
      // setCustomHeight(limit.min);
    } else if (customHeight > limit.max) {
      // setCustomHeight(limit.max);
    } else {
      setCustomHeight(Math.floor(customHeight));
    }
  };

  const layoutToggle = {
    label: "Aspect Ratio",
    options: layouts.map((l) => ({ label: l.label })),
    onChange: handleLayoutChange,
    isSelected: (label: string) => layout.label === label,
  };

  return (
    <ControlGroup title="Layout">
      {/* <div className="flex items-center">
        <label>Aspect Ratio</label>
        <select onChange={handleLayoutChange} value={layout.label}>
          {layouts.map((layout) => (
            <option key={layout.label} value={layout.label}>
              {layout.label}
            </option>
          ))}
        </select>
      </div> */}

      <Toggle {...layoutToggle} />

      {layout.label === "Custom" && (
        <div className="flex items-center">
          {/* <label></label> */}
          <div className="flex flex-col gap-y-1">
            <div className="flex gap-x-2 items-center w-[300px]">
              <div className="flex items-center gap-x-1 grow">
                <input
                  className={`grow flex ${
                    isOutsideLimit(true, false) ? "outline-red-500" : ""
                  }`}
                  style={
                    isOutsideLimit(true, false) ? { borderColor: "red" } : {}
                  }
                  type="number"
                  min={320}
                  max={3840}
                  value={customWidth}
                  onChange={handleWidthChange}
                  onBlur={handleWidthBlur}
                  // pattern="[0-9]"
                  // step={1}
                />
                x
                <input
                  className={`grow flex ${
                    isOutsideLimit(false, true) ? "outline-red-500" : ""
                  }`}
                  style={
                    isOutsideLimit(false, true) ? { borderColor: "red" } : {}
                  }
                  type="number"
                  min={320}
                  max={3840}
                  value={customHeight}
                  onChange={handleHeightChange}
                  onBlur={handleHeightBlur}
                />
                px
              </div>
              <button onClick={handleCustomSize} disabled={isDisabled()}>
                Apply
              </button>
            </div>
            {isOutsideLimit() && (
              <div className="text-red-500 text-sm">
                Min: {limit.min}px / Max: {limit.max}px
              </div>
            )}
          </div>
        </div>
      )}

      <ControlGrid />
    </ControlGroup>
  );
};

export default ControlLayout;
