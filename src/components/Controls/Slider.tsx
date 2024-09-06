import { useCallback, useEffect, useRef, useState } from "react";
import { MathUtils } from "three";

interface SliderProps {
  label: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  normalized?: boolean;
  onChange?: (value: number) => void;
}

const Slider = ({
  label,
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

  const [value, setValue] = useState(
    defaultValue !== undefined
      ? normalized
        ? map(defaultValue, 0, 1, min, max)
        : defaultValue
      : 50
  );

  const sliderProgress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sliderProgress.current) {
      sliderProgress.current.style.width = `${map(value, min, max, 1, 99)}%`;
    }
  }, [value, map, min, max]);

  const handleChange = (value: string) => {
    setValue(Number(value));
    if (onChange) {
      onChange(normalized ? map(Number(value)) : Number(value));
    }
  };

  return (
    <div className="flex items-cetner">
      <label className="w-[200px]">{label}</label>
      <div className="flex items-center gap-x-2">
        <div className="relative h-3 flex w-[200px]">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            step={step}
            onChange={(e) => handleChange(e.target.value)}
            className="z-10 w-full"
          />
          <div
            ref={sliderProgress}
            className="absolute events-none left-0 top-0 h-3 bg-slate-400 z-1"
            style={{ width: `${map(value, min, max, 1, 99)}%` }}
          />
        </div>
        <div className="text-sm w-[40px]">{Math.floor(value)}</div>
      </div>
    </div>
  );
};

export default Slider;
