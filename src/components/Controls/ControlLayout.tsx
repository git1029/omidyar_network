import { ChangeEvent, useState } from "react";
import { layouts } from "../../store/options";
import useStore from "../../store/store";
import ControlGroup from "../Core/ControlGroup";
import ControlGrid from "./ControlGrid";
import Toggle from "../Core/Toggle";
import { Layout } from "../../types";

const ControlLayout = () => {
  const layout = useStore((state) => state.layout);
  const customLayout = useStore((state) => state.customLayout);
  const setValue = useStore((state) => state.setValue);

  const handleLayoutChange = <T,>(value: T) => {
    if (value === layout) return;
    const match = layouts.find((l) => l === value);
    if (match) {
      if (match.label === "Custom") setValue("layout", customLayout);
      setValue("layout", match);
    }
  };

  const handleCustomSize = () => {
    const newCustomLayout = {
      ...customLayout,
      aspect: customWidth / customHeight,
      size: { width: customWidth, height: customHeight },
    };

    setValue("customLayout", newCustomLayout);
    setValue("layout", newCustomLayout);
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
    if (customWidth < limit.min || customWidth > limit.max) return;
    setCustomWidth(Math.floor(customWidth));
  };

  const handleHeightBlur = () => {
    if (customHeight < limit.min || customHeight > limit.max) return;
    setCustomHeight(Math.floor(customHeight));
  };

  const layoutToggle = {
    label: "Aspect Ratio",
    value: layout,
    options: layouts,
    onChange: handleLayoutChange,
  };

  return (
    <ControlGroup title="Layout">
      <Toggle<Layout> {...layoutToggle} />

      {layout.label === "Custom" && (
        <div className="flex items-center">
          <div className="flex flex-col gap-y-1">
            <div className="flex gap-x-2 items-center w-[300px]">
              <div className="flex items-center gap-x-1 grow">
                <input
                  className={`grow flex`}
                  style={
                    isOutsideLimit(true, false) ? { borderStyle: "dashed" } : {}
                  }
                  type="number"
                  min={320}
                  max={3840}
                  value={customWidth}
                  onChange={handleWidthChange}
                  onBlur={handleWidthBlur}
                />
                x
                <input
                  className={`grow flex`}
                  style={
                    isOutsideLimit(false, true) ? { borderStyle: "dashed" } : {}
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
              <div className="text-contrast text-sm">
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
