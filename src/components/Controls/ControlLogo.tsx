import { logoOptions } from "../../store/options";
import useStore from "../../store/store";
import { LogoOption } from "../../types";
import Control from "../Core/Control";
import Toggle from "../Core/Toggle";
import ControlGroup from "./ControlGroup";

const ControlLogo = () => {
  const caption = useStore((state) => state.caption);
  const logo = useStore((state) => state.logo);
  const setValue = useStore((state) => state.setValue);

  const handleLogoClick = <T,>(value: T) => {
    if (logo === value) return;
    const match = logoOptions.find((o) => o === value);
    if (match) {
      setValue("logo", match);
    }
  };

  const logoToggleProps = {
    label: "Logo",
    options: logoOptions,
    value: logo,
    onChange: handleLogoClick,
  };

  return (
    <ControlGroup title="Logo & Caption">
      {/* <Control label="Logo">
        <div className="flex gap-x-1">
          <button onClick={() => handleLogoClick(0)}>Off</button>
          <button onClick={() => handleLogoClick(1)}>Logo</button>
          <button onClick={() => handleLogoClick(2)}>Emblem</button>
        </div>
      </Control> */}
      <Toggle<LogoOption> {...logoToggleProps} />

      <Control label="Caption">
        <textarea
          rows={1}
          className="font-sans"
          value={caption}
          onChange={(e) => setValue("caption", e.target.value)}
        ></textarea>
      </Control>
    </ControlGroup>
  );
};

export default ControlLogo;
