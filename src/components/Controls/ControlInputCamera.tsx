import { useEffect, useRef } from "react";
import useStore from "../../store/store";
import useCamera from "../../helpers/useCamera";

const ControlInputCamera = ({ inverted }: { inverted: boolean }) => {
  const cameraRef = useRef<HTMLVideoElement>(null);

  const inputMode = useStore((state) => state.inputMode);
  const cameraStatus = useStore((state) => state.cameraStatus);
  const setCameraRef = useStore((state) => state.setCameraRef);

  useEffect(() => {
    if (cameraRef.current) {
      setCameraRef(cameraRef.current);
    }
  }, [setCameraRef, cameraRef]);

  useCamera();

  return (
    <div
      className={`border-dashed border-black-100 border w-[300px] overflow-hidden text-sm rounded-sm p-2 ${
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
          style={{ backgroundColor: "rgba(0, 0, 0, .05)" }}
        >
          <video
            className={inverted ? "filter invert" : ""}
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
