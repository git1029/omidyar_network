import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";

const Pattern = () => {
  return (
    <div className="w-1/2 flex p-8 border border-black">
      <div className="h-full w-full">
        <Canvas
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            gl.setClearColor(0xff0000);
          }}
          camera={{
            fov: 45,
            near: 0.01,
            far: 100,
            position: [0, 0, 20],
          }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <mesh>
            <sphereGeometry />
            <meshNormalMaterial />
          </mesh>
          <Perf />
        </Canvas>
      </div>
    </div>
  );
};

export default Pattern;
