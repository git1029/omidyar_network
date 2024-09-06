import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import PatternGL from "./PatternGL/PatternGL";

const Pattern = () => {
  return (
    <div className="w-1/2 flex p-8 border border-black items-center justify-center">
      {/* <div className="h-full w-full"> */}
      <div className="h-[1000px] w-[1000px] min-w-[1000px]">
        <Canvas
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000);
          }}
          camera={{
            fov: 45,
            near: 0.01,
            far: 100,
            position: [0, 0, 20],
          }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <PatternGL />
          <Perf />
        </Canvas>
      </div>
    </div>
  );
};

export default Pattern;
