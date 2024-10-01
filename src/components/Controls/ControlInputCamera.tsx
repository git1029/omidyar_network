import { useEffect, useRef } from "react";
import useStore from "../../store/store";
import useCamera from "../../helpers/useCamera";

// const ControlInputCamera = ({ inverted }: { inverted: boolean }) => {
const ControlInputCamera = () => {
  const cameraRef = useRef<HTMLVideoElement>(null);

  const inputMode = useStore((state) => state.inputMode);
  const cameraStatus = useStore((state) => state.cameraStatus);
  const setValue = useStore((state) => state.setValue);

  useEffect(() => {
    if (cameraRef.current) {
      setValue("cameraRef", cameraRef.current);
    }
  }, [setValue, cameraRef]);

  useCamera();

  return (
    <div
      className={`border border-foreground/50 border w-[300px] overflow-hidden text-sm rounded-md p-2 ${
        inputMode.value === 2 ? "flex" : "hidden"
      }`}
    >
      <div className="flex flex-col gap-y-2 relative">
        {cameraStatus < 2 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-left px-2">
            {cameraStatus === 0
              ? "Unable to access camera/webcam. Please check browser/device permissions."
              : "Loading..."}
          </div>
        )}
        <div
          className="flex w-auto h-auto items-center justify-center"
          // style={{ backgroundColor: "rgba(0, 0, 0, .05)" }}
        >
          <video
            // className={`-scale-x-100 ${inverted ? "filter invert" : ""}`}
            className={`-scale-x-100`}
            ref={cameraRef}
            autoPlay
            playsInline
            muted
          ></video>
        </div>
      </div>
    </div>
  );
};

export default ControlInputCamera;
