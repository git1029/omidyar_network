import { ColorInfo } from "../../types";
import IconTransparent from "/icon_transparent.svg";

const ColorIcon = ({
  color,
  onClick,
  selected,
}: {
  color: ColorInfo;
  onClick?: () => void;
  selected: boolean;
}) => {
  // const line = () => `
  //   absolute left-0 top-0 w-6 h-px -translate-x-1/2 -translate-y-1/2 ${
  //     color.label === "Black" ? "bg-gray-100" : "bg-black-100"
  //   }
  //   `;

  return (
    <div
      className={`w-5 h-4 border border-foreground cursor-pointer relative ${
        selected ? "border-foreground" : "border-foreground/50"
      }`}
      style={{
        backgroundColor: color.hex,
        backgroundImage:
          color.label === "Transparent" ? `url(${IconTransparent})` : "none",
      }}
      onClick={onClick}
    >
      <span
        className={`w-full h-full absolute top-1/2 left-1/2 flex ${
          selected ? "" : "hidden"
        }`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: color.contrast }}
        ></span>
        {/* {color.label !== "Transparent" && (
          <span className={`${line()} rotate-[39deg]`}></span>
        )}
        <span className={`${line()} -rotate-[39deg]`}></span> */}
      </span>
    </div>
  );
};

export default ColorIcon;
