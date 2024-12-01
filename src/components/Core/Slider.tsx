import { useCallback, useEffect, useRef, useState } from "react";
import { MathUtils } from "three";

interface SliderProps {
  label: string;
  value?: number;
  setValue?: (value: number) => void;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  normalized?: boolean;
  onChange?: (value: number) => void;
}

const Slider = ({
  label,
  value,
  setValue,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  normalized = true,
  onChange,
}: SliderProps) => {
  const map = useCallback(
    (value: number, mn = min, mx = max, outMin = 0, outMax = 1) =>
      MathUtils.mapLinear(Number(value), mn, mx, outMin, outMax),
    [min, max]
  );

  const [value_, setValue_] = useState(
    defaultValue !== undefined
      ? normalized
        ? map(defaultValue, 0, 1, min, max)
        : defaultValue
      : 50
  );

  const val = value !== undefined ? value : value_;
  const setVal = setValue !== undefined ? setValue : setValue_;

  const sliderProgress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sliderProgress.current) {
      const s = map(val, min, max, 1, 99);
      sliderProgress.current.style.width = `${s}%)`;
    }
  }, [val, map, min, max]);

  const handleChange = (value: string) => {
    setVal(Number(value));
    if (onChange) {
      onChange(normalized ? map(Number(value)) : Number(value));
    }
  };

  const countDecimals = (step: number) => {
    const str = step.toString();
    const n = str.split(".");
    if (n[1] !== undefined) return n[1].length;
    return 0;
  };

  return (
    <div className="flex flex-col gap-y-1">
      <label>{label}</label>
      <div className="flex items-center gap-x-2 border border-contrast h-6 px-2 rounded-md w-fit">
        <div className="relative h-6 flex w-[200px]">
          <input
            type="range"
            min={min}
            max={max}
            value={val}
            step={step}
            onChange={(e) => handleChange(e.target.value)}
            className="z-10 w-full"
          />
          <div className="absolute events-none left-0 top-1/2 h-px right-0 z-1 -translate-y-1/2 bg-contrast/50" />
          <div
            ref={sliderProgress}
            className="absolute events-none left-0 top-1/2 h-px bg-contrast z-1 -translate-y-1/2"
            style={{ width: `${map(val, min, max, 1, 99)}%` }}
          />
        </div>
        {/* <div className="text-sm w-[30px] text-center">{Math.floor(value)}</div> */}
        <div className="text-sm w-[30px] text-center">
          {val.toFixed(countDecimals(step))}
        </div>
      </div>
    </div>
  );
};

export default Slider;
