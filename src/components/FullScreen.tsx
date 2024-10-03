import { useEffect } from "react";
import useStore from "../store/store";

const FullScreen = () => {
  const setValue = useStore((state) => state.setValue);
  const { exporting } = useStore((state) => state.exportSettings);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setValue("fullscreen", document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [setValue]);

  const toggleFullScreen = () => {
    if (exporting) return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  if (exporting) return null;

  return (
    <div className="uppercase cursor-pointer" onClick={toggleFullScreen}>
      Full Screen
    </div>
  );
};

export default FullScreen;
