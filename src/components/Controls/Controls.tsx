import ControlInput from "./ControlInput";
import ControlLayout from "./ControlLayout";
// import ControlGrid from "./ControlGrid";
import Pattern from "./Pattern";
import Color from "./Color";
import ControlExport from "./ControlExport";
import ControlText from "./ControlText";
// import Logo from "/logo_light.svg";
import { ExportObject } from "../Scene";
import { MutableRefObject } from "react";
import useStore from "../../store/store";
import Logo from "../Logo";
import FullScreen from "../FullScreen";
import ControlLogo from "./ControlLogo";

const Gradient = ({ reverse = false }) => {
  return (
    <div
      className={`absolute left-[-2px] right-[15px] z-20 h-[40px] pointer-events-none ${
        reverse ? "top-[-40px]" : "bottom-[-40px]"
      }`}
    >
      <div
        className={`w-full h-full from-background to-background/0 ${
          reverse ? "bg-gradient-to-t" : "bg-gradient-to-b"
        }`}
        // style={{
        //   // boxShadow: "0 0 30px 30px #90a7d6",
        //   backgroundImage: `linear-gradient(${
        //     reverse ? "to top" : "to bottom"
        //   }, , rgba(144, 167, 214, 0))`,
        // }}
      ></div>
    </div>
  );
};

const ControlsHeader = () => {
  return (
    <div className="flex items-center gap-x-2 pb-6 relative">
      {/* <img src={Logo} className="w-14 h-14" /> */}
      <h1>Omidyar Network</h1>
      <Gradient />
    </div>
  );
};

const Controls = ({
  ffmpeg,
}: {
  ffmpeg: MutableRefObject<ExportObject | null>;
}) => {
  const fullscreen = useStore((state) => state.fullscreen);

  return (
    <div
      className={`w-[430px] 2xl:w-[630px] flex transition-opacity duration-500 ease-in-out ${
        fullscreen ? "opacity-0 pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-col grow p-8">
        <ControlsHeader />
        <div
          className="overflow-y-scroll h-full flex flex-col gap-y-6 relative pt-[40px] pb-[40px]"
          style={{ scrollbarColor: "rgb(var(--foreground-color)) transparent" }}
        >
          <p className="font-serif">
            Design a digital pattern that's uniquely yours. Upload media that
            represents you, customize the design, and export your personalized
            creation for any need.
          </p>
          <div className="flex flex-col gap-y-1">
            <ControlInput />
            <ControlLayout />
            {/* <ControlGrid /> */}
            <Pattern />
            <Color />
            <ControlText />
            <ControlLogo />
            <ControlExport ffmpeg={ffmpeg} />
          </div>
        </div>
        <div className="relative pt-4">
          <Gradient reverse={true} />
          {/* <img src={Logo} width={50} height="auto" /> */}
          <div className="flex items-center justify-between">
            <Logo />
            <FullScreen />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
