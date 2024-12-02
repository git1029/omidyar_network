import ControlInput from "./ControlInput";
import ControlLayout from "./ControlLayout";
import ControlPattern from "./ControlPattern";
import ControlColor from "./ControlColor";
import ControlExport from "./ControlExport";
import ControlText from "./ControlText";
import { ExportObject } from "../Scene";
import { MutableRefObject, useRef, useState } from "react";
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
      ></div>
    </div>
  );
};

const ControlsHeader = () => {
  return (
    <div className="flex items-center gap-x-2 px-4 lg:px-0 pb-6 relative bg-background">
      <div className="flex items-center grow gap-x-2 justify-between">
        <h1 className="relative">Omidyar Network</h1>
        <Logo size={40} className="lg:hidden" />
      </div>
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
  const mobileAgent = useStore((state) => state.mobileAgent);
  const exportSettings = useStore((state) => state.exportSettings);

  const [controlsOpen, setControlsOpen] = useState(false);

  const controls = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`w-full h-full z-50 absolute lg:relative lg:w-[430px] lg:min-w-[430px] 2xl:w-[630px] 2xl:min-w-[630px] flex transition-opacity duration-500 ease-in-out ${
        fullscreen ? "opacity-0 pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-col grow pt-4 lg:p-8">
        <ControlsHeader />
        <div
          className={`overflow-y-scroll h-full flex flex-col gap-y-6 transition-opacity bg-background duration-500 ease-in-out relative px-4 lg:px-0 pt-[40px] pb-[40px] ${
            controlsOpen
              ? "opacity-100"
              : "opacity-0 touch-none pointer-events-none"
          } lg:opacity-100 lg:touch-auto lg:pointer-events-auto`}
          style={{ scrollbarColor: "rgb(var(--contrast-color)) transparent" }}
          ref={controls}
        >
          <p className="font-serif">
            Design a pattern that reflects Omidyar Network's brand identity.
            Upload media that represents our vision/mission, customize the
            design, and export a creation for any need.
          </p>
          <div
            className={`flex flex-col gap-y-1 transition-opacity duration-250 ease-in-out ${
              exportSettings.exporting ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <ControlInput />
            <ControlLayout />
            <ControlPattern />
            <ControlColor />
            <ControlText />
            <ControlLogo />
            {!mobileAgent && <ControlExport ffmpeg={ffmpeg} />}
          </div>
        </div>
        {!mobileAgent && (
          <div className="hidden lg:block relative pt-4">
            <Gradient reverse={true} />
            <div className="flex items-center justify-between">
              <Logo />
              <FullScreen />
            </div>
          </div>
        )}
        <div className="p-4 lg:hidden relative">
          <div className={`flex flex-col border border-contrast/50 rounded-lg`}>
            <Gradient reverse={true} />
            <div
              className="cursor-pointer px-3 py-2"
              onClick={() => setControlsOpen(!controlsOpen)}
            >
              <h2>{controlsOpen ? "Hide Controls" : "Controls"}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
