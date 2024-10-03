import { useEffect, useRef } from "react";
import Controls from "./components/Controls/Controls";
import Scene, { ExportObject } from "./components/Scene";
import Entry from "./components/Entry";
import useStore from "./store/store";

const App = () => {
  const ffmpeg = useRef<ExportObject | null>(null);

  const setValue = useStore((state) => state.setValue);

  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // User is accessing the page on a mobile device
      // console.log("Mobile device detected");
      setValue("mobileAgent", true);
    } else {
      // User is accessing the page on a desktop device
      // console.log("Desktop device detected");
      setValue("mobileAgent", false);
    }
  }, [setValue]);

  return (
    <div className="flex grow text-contrast gap-x-0 h-full w-full animate-fade">
      <Controls ffmpeg={ffmpeg} />
      <Scene ffmpeg={ffmpeg} />
      <Entry />
    </div>
  );
};

export default App;
