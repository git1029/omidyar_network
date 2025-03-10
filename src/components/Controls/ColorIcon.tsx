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
  return (
    <div
      className={`w-5 h-4 border border-contrast cursor-pointer relative ${
        selected ? "border-contrast" : "border-contrast/50"
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
      </span>
    </div>
  );
};

export default ColorIcon;
