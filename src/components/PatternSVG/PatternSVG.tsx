import { Instance, Instances } from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
// import { useMemo } from "react";
// import { AdditiveBlending } from "three";
import useNodes from "./useNodes";
import { AdditiveBlending } from "three";

// interface Node {
//   i: number;
//   p: Vector2;
//   r: number;
// }

const PatternSVG = () => {
  // const { viewport } = useThree();

  // const [grid, uniforms] = useMemo(() => {
  //   const grid = 10;
  //   const uniforms = {
  //     uGrid: new Uniform(grid),
  //   };
  //   return [grid, uniforms];
  // }, []);

  // const nodes: Node[] = useMemo(() => {
  //   const nodes = [];
  //   for (let i = 0; i < grid * grid; i++) {
  //     const x = i % grid;
  //     const y = Math.floor(i / grid);
  //     const r = viewport.width / grid;
  //     const p = new Vector2(
  //       (x / grid - 0.5) * viewport.width + (viewport.width / grid) * 0.5,
  //       (y / grid - 0.5) * viewport.height + (viewport.height / grid) * 0.5
  //     );

  //     const neighbours = [];
  //     for (let j = -1; j <= 1; j++) {
  //       for (let k = -1; k <= 1; k++) {
  //         if (j === 0 && k === 0) continue;
  //         const x_ = x + j;
  //         const y_ = y + k;
  //         if (x_ < 0 || x_ >= grid || y_ < 0 || y_ >= grid) continue;
  //         const i = x_ + y_ * grid;
  //         let dir = "";
  //         if (j === -1 && k === -1) dir = "tl";
  //         if (j === 0 && k === -1) dir = "t";
  //         if (j === 1 && k === -1) dir = "tr";
  //         if (j === 1 && k === 0) dir = "r";
  //         if (j === 1 && k === 1) dir = "br";
  //         if (j === 0 && k === 1) dir = "b";
  //         if (j === -1 && k === 1) dir = "bl";
  //         if (j === -1 && k === 0) dir = "l";
  //         neighbours.push({ node: i, dir });
  //       }
  //     }

  //     nodes.push({ i, p, r, neighbours });
  //   }

  //   console.log(nodes);
  //   return nodes;
  // }, [viewport, grid]);

  const { nodes, uniforms } = useNodes();

  if (!nodes) return null;

  const scl = 1;

  return (
    <>
      <Instances limit={60 * 60}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={
            /* glsl */ `
                varying vec2 vUv;

                void main() {
                  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
                  vec4 viewPosition = viewMatrix * modelPosition;
                  vec4 projectedPosition = projectionMatrix * viewPosition;
                  gl_Position = projectedPosition;
              
                  vUv = uv;
                }
              `
          }
          fragmentShader={
            /* glsl */ `
            uniform float uGrid;
                varying vec2 vUv;

                void main() {
                  // float d = smoothstep(.0 - mix(.001, .075, clamp(uGrid, 0., 60.)/60.), .5, length(vUv - .5));
                  float d = smoothstep(.5 - mix(.001, .075, clamp(uGrid, 0., 60.)/60.), .5, length(vUv - .5));
                  gl_FragColor = vec4(vec3(1.), 1.-d);
                }
              `
          }
          uniforms={uniforms}
          transparent={true}
          blending={AdditiveBlending}
        />
        {nodes.map((n) => {
          return (
            <Instance
              key={n.i}
              position={[n.p.x, n.p.y, 0]}
              scale={[n.r * scl, n.r * scl, 1]}
            />
          );
        })}
      </Instances>
    </>
  );

  //   return (
  //     <>
  //       {nodes.map((n) => {
  //         return (
  //           <mesh
  //             key={n.i}
  //             position={[n.p.x, n.p.y, 0]}
  //             scale={[n.r * scl, n.r * scl, 1]}
  //           >
  //             <planeGeometry args={[1, 1]} />
  //             {/* <meshNormalMaterial /> */}
  //             <shaderMaterial
  //               vertexShader={
  //                 /* glsl */ `
  //                 varying vec2 vUv;

  //                 void main() {
  //                   vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  //                   vec4 viewPosition = viewMatrix * modelPosition;
  //                   vec4 projectedPosition = projectionMatrix * viewPosition;
  //                   gl_Position = projectedPosition;

  //                   vUv = uv;
  //                 }
  //               `
  //               }
  //               fragmentShader={
  //                 /* glsl */ `
  //                 varying vec2 vUv;

  //                 void main() {
  //                   float d = smoothstep(.495, .5, length(vUv - .5));
  //                   gl_FragColor = vec4(vec3(1.), 1.-d);
  //                 }
  //               `
  //               }
  //               transparent={true}
  //             />
  //           </mesh>
  //         );
  //       })}
  //     </>
  //   );
  // };
};

export default PatternSVG;
