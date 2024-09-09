import { useRef } from "react";
import Controls from "./components/Controls/Controls";
import Scene, { ExportObject } from "./components/Scene";

function App() {
  // const fade = useRef<HTMLDivElement>(null);

  const ffmpeg = useRef<ExportObject | null>(null);

  return (
    <div className="flex grow bg-gray-100 text-black-100 gap-x-0 h-full">
      <Controls ffmpeg={ffmpeg} />
      <Scene ffmpeg={ffmpeg} />
    </div>
  );
}

export default App;
