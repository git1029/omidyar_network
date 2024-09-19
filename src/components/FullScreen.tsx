import { useEffect } from "react";
import useStore from "../store/store";
// import { scaleCanvasScreen } from "../helpers/useResize";

const FullScreen = () => {
  const setFullscreen = useStore((state) => state.setFullscreen);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) setFullscreen(true);
      else setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [setFullscreen]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="uppercase cursor-pointer" onClick={toggleFullScreen}>
      Full Screen
    </div>
  );
};

export default FullScreen;
