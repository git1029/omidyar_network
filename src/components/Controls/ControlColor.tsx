import ControlGroup from "./ControlGroup";
import { colors } from "../../store/options";
import useStore from "../../store/store";
import { useShallow } from "zustand/react/shallow";

const ControlColor = () => {
  const [backgroundColor, setBackgroundColor, nodeColor, setNodeColor] =
    useStore(
      useShallow((state) => [
        state.backgroundColor,
        state.setBackgroundColor,
        state.nodeColor,
        state.setNodeColor,
      ])
    );

  const options = [
    {
      label: "Background",
      onClick: (color: string) => setBackgroundColor(color),
    },
    { label: "Foreground", onClick: (color: string) => setNodeColor(color) },
  ];

  const isSelected = (color: string, value: string) => {
    if (
      (color === "Background" && value === backgroundColor) ||
      (color === "Foreground" && value === nodeColor)
    )
      return true;
  };

  const line = (color: string) => `
  
  
    absolute left-0 top-0 w-6 h-px -translate-x-1/2 -translate-y-1/2 ${
      color === "#3a3a3a" ? "bg-gray-100" : "bg-black-100"
    }
    `;

  return (
    <ControlGroup>
      <h2>Color</h2>

      <div>
        {options.map((color) => (
          <div key={color.label} className="flex items-center">
            <label className="w-[200px]">{color.label}</label>
            <div className="flex gap-x-0.5">
              {colors.map((c) => {
                return (
                  <div
                    key={`color-${c}`}
                    className="w-5 h-4 border border-black-100 cursor-pointer"
                    style={{ backgroundColor: c }}
                    onClick={() => color.onClick(c)}
                  >
                    <span
                      className={`w-full h-full relative left-1/2 top-1/2 flex ${
                        isSelected(color.label, c) ? "" : "hidden"
                      }`}
                    >
                      <span className={`${line(c)} rotate-[39deg]`}></span>
                      <span className={`${line(c)} -rotate-[39deg]`}></span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ControlGroup>
  );
};

export default ControlColor;
