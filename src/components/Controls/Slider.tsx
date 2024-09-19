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
      const s = map(value, min, max, 1, 99);
      sliderProgress.current.style.width = `${s}%)`;
    }
  }, [value, map, min, max]);

  const handleChange = (value: string) => {
    setValue(Number(value));
    if (onChange) {
      onChange(normalized ? map(Number(value)) : Number(value));
    }
  };

  return (
    <div className="flex flex-col gap-y-1">
      <label>{label}</label>
      <div className="flex items-center gap-x-2 border border-foreground h-6 px-2 rounded-md w-fit">
        <div className="relative h-6 flex w-[200px]">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            step={step}
            onChange={(e) => handleChange(e.target.value)}
            className="z-10 w-full"
          />
          <div className="absolute events-none left-0 top-1/2 h-px right-0 z-1 -translate-y-1/2 bg-foreground/50" />
          <div
            ref={sliderProgress}
            className="absolute events-none left-0 top-1/2 h-px bg-foreground z-1 -translate-y-1/2"
            style={{ width: `${map(value, min, max, 1, 99)}%` }}
          />
        </div>
        <div className="text-sm w-[30px] text-center">{Math.floor(value)}</div>
      </div>
    </div>
  );
};

export default Slider;
