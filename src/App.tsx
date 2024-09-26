import { useRef } from "react";
import Controls from "./components/Controls/Controls";
import Scene, { ExportObject } from "./components/Scene";
import Entry from "./components/Entry";

const App = () => {
  const ffmpeg = useRef<ExportObject | null>(null);

  return (
    <div className="flex grow text-foreground border-foreground gap-x-0 h-full w-full animate-fade">
      <Controls />
      <Scene ffmpeg={ffmpeg} />
      <Entry />
    </div>
  );
};

export default App;
