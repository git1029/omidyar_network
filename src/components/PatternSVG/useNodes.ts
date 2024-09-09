import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import {
  // BufferGeometry,
  // DoubleSide,
  MathUtils,
  // Mesh,
  // MeshBasicMaterial,
  // Path,
  // PlaneGeometry,
  // ShaderMaterial,
  // Shape,
  // ShapeGeometry,
  // Uniform,
  Vector2,
} from "three";
// import { metaball } from "./metaball";

interface Neighbour {
  node: number;
  dir: string;
}

interface Node {
  i: number;
  p: Vector2;
  r: number;
  neighbours: Neighbour[];
}

const useNodes = (grid = 20) => {
  const { viewport } = useThree();

  // const [uniforms] = useMemo(() => {
  //   // const grid = 20;
  //   const uniforms = {
  //     uGrid: new Uniform(grid),
  //   };
  //   return [uniforms];
  // }, []);

  const nodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    for (let i = 0; i < grid * grid; i++) {
      const x = i % grid;
      const y = Math.floor(i / grid);
      const r = (viewport.width / grid / MathUtils.lerp(1, 1, i % 2)) * 0.5;
      const p = new Vector2(
        (x / grid - 0.5) * viewport.width + (viewport.width / grid) * 0.5,
        (y / grid - 0.5) * viewport.height + (viewport.height / grid) * 0.5
      );

      const neighbours = [];
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          if (j === 0 && k === 0) continue;
          const x_ = x + j;
          const y_ = y + k;
          if (x_ < 0 || x_ >= grid || y_ < 0 || y_ >= grid) continue;
          const i = x_ + y_ * grid;
          let dir = "";
          if (j === -1 && k === -1) dir = "tl";
          if (j === 0 && k === -1) dir = "t";
          if (j === 1 && k === -1) dir = "tr";
          if (j === 1 && k === 0) dir = "r";
          if (j === 1 && k === 1) dir = "br";
          if (j === 0 && k === 1) dir = "b";
          if (j === -1 && k === 1) dir = "bl";
          if (j === -1 && k === 0) dir = "l";
          neighbours.push({ node: i, dir });
        }
      }

      nodes.push({ i, p, r, neighbours });
    }

    // nodes.forEach((node) => {
    //   const l = node.neighbours.find((n) => n.dir === "l");
    //   if (l) {
    //     const left = nodes.find((n) => n.i === l.node);

    //     if (left) {
    //       const m = metaball(node.r / 2, left.r / 2, node.p, left.p);
    //       // console.log(m);

    //       if (m) {
    //         const shape = new Shape();
    //         for (let i = 0; i < m.length; i++) {
    //           const c = m[i];
    //           if (c.type === "M") shape.moveTo(c.a.x, c.a.y);
    //           // if (c.type === "L") shape.lineTo(c.a.x, c.a.y);
    //           // else if (c.type === "L") shape.lineTo(c.a.x, c.a.y);
    //           else if (c.type === "C")
    //             shape.bezierCurveTo(
    //               c.c1.x,
    //               c.c1.y,
    //               c.c2.x,
    //               c.c2.y,
    //               c.a.x,
    //               c.a.y
    //             );
    //         }

    //         const geometry = new ShapeGeometry(shape, 32);
    //         // const geometry = new PlaneGeometry(1, 1);
    //         // console.log(geometry.attributes.position);

    //         // const position = geometry.attributes.position;
    //         // for (let i = 0; i < m.length; i++) {
    //         //   const c = m[i];
    //         //   position.setXYZ(i, c.a.x, c.a.y, 0);
    //         //   // if (c.type === "L") shape.lineTo(c.a.x, c.a.y);
    //         //   // else if (c.type === "L") shape.lineTo(c.a.x, c.a.y);
    //         //   // else if (c.type === "C")
    //         //   //   shape.bezierCurveTo(
    //         //   //     c.c1.x,
    //         //   //     c.c1.y,
    //         //   //     c.c2.x,
    //         //   //     c.c2.y,
    //         //   //     c.a.x,
    //         //   //     c.a.y
    //         //   //   );
    //         //   // position.needsUpdate = true;
    //         // }
    //         // position.needsUpdate = true;
    //         // console.log(geometry);

    //         // const material = new MeshBasicMaterial({ color: 0xffffff });
    //         const material = new ShaderMaterial({
    //           vertexShader: /* glsl */ `
    //                 varying vec2 vUv;

    //                 void main() {
    //                   vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    //                   vec4 viewPosition = viewMatrix * modelPosition;
    //                   vec4 projectedPosition = projectionMatrix * viewPosition;
    //                   gl_Position = projectedPosition;

    //                   vUv = uv;
    //                 }
    //               `,
    //           fragmentShader: /* glsl */ `
    //             uniform float uGrid;
    //                 varying vec2 vUv;

    //                 void main() {
    //                   vec2 uv = vUv;
    //                   // uv.x = 1.-vUv.y;
    //                   // uv.y = vUv.x;
    //                   // float d = smoothstep(.0 - mix(.001, .075, clamp(uGrid, 0., 60.)/60.), .5, length(vUv - .5));
    //                   float d = smoothstep(0., .01, 1.-(1.-sin(uv.y *3.14159)) * mix(1., 10., sin(uv.x * 3.14159)));
    //                   // float d = 1.;
    //                   gl_FragColor = vec4(vec3(1.), 1.);
    //                 }
    //               `,
    //           // wireframe: true,
    //           // side: DoubleSide,
    //           transparent: true,
    //         });
    //         const mesh = new Mesh(geometry, material);
    //         // scene.add(mesh);
    //       }
    //     }
    //   }
    // });

    console.log(nodes);
    return nodes;
  }, [viewport, grid]);

  // useFrame(() => {

  // })

  return {
    nodes,
    // uniforms,
    grid,
  };
};

export default useNodes;
