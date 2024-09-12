import {
  Instance,
  Instances,
  useFBO,
  useTexture,
  // useTexture,
  // useVideoTexture,
} from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
// import { useMemo } from "react";
// import { AdditiveBlending } from "three";
import useNodes from "./useNodes";
import {
  AdditiveBlending,
  Scene,
  ShaderMaterial,
  Uniform,
  Vector2,
} from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";

// interface Node {
//   i: number;
//   p: Vector2;
//   r: number;
// }

const PatternSVG = () => {
  // const { viewport } = useThree();

  // const tex = useTexture("/download.png");

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

  const { viewport, gl, camera } = useThree();

  const [scene] = useState(new Scene());

  const target = useFBO(512 * 1, 512 * 1);

  useFrame(() => {
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    // target.texture.needsUpdate = true;
    gl.setRenderTarget(null);
  });

  return (
    <>
      {createPortal(<PatternScene />, scene)}
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={
            /* glsl */ `
            varying vec2 vUv;

            void main() {
              vec4 modelPosition = modelMatrix * vec4(position, 1.0);
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
            uniform sampler2D uImage;

            void main() {
              vec4 c = texture(uImage, vUv);
              vec4 cc = vec4(smoothstep(.75, .85, c.rgb), 1.);
              // cc = mix(vec4(vec3(0.), 1.), cc, c.r);
              gl_FragColor = cc;
            }
          `
          }
          transparent={true}
          uniforms={{
            uImage: new Uniform(target.texture),
          }}
        />
      </mesh>
    </>
  );
};

const PatternScene = () => {
  const grid = 30;
  const { nodes } = useNodes(grid);

  const { viewport } = useThree();

  const ref = useRef<ShaderMaterial>(null);

  // const vid = useVideoTexture("/footage.mp4");
  const vid = useTexture("/img.jpg");

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.uniforms.uTime.value += delta;
    }
  });

  // const u = useMemo(() => {

  // })

  const u = useMemo(() => {
    return {
      uTime: new Uniform(0),
      uVideo: new Uniform(null),
      uViewport: new Uniform(new Vector2(1, 1)),
      uScale: new Uniform(1),
      uGrid: new Uniform(grid),
    };
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.uniforms.uVideo.value = vid;
    }
  }, [vid]);

  useEffect(() => {
    if (ref.current) {
      ref.current.uniforms.uViewport.value.set(viewport.width, viewport.height);
    }
  }, [viewport]);

  // console.log(uniforms);
  if (!nodes) return null;

  return (
    <Instances limit={60 * 60} visible={true}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={ref}
        vertexShader={
          /* glsl */ `
            varying vec2 vUv;
            varying float vS;
            varying float vScl;
            uniform float uTime;
            uniform sampler2D uVideo;
            uniform vec2 uViewport; 
            uniform float uGrid;
            // uniform float uScale;

            void main() {
              vec3 pos = position;
              vec2 off = (modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.)).xy; // get circle instance position

              float uDensity = 1.;
              // p *= uDensity;
              float smx = 3.;
              vec2 uvs = off.xy/uViewport + .5;
              float c = texture(uVideo, uvs).r;
              if (c < .1) c = 0.;
              // pos *= mix(1., 3., sin(uTime + float(gl_InstanceID) * 0. + uv.x) * .5 + .5);
              float s = mix(.0, smx, c);
              pos *= s;
              // float scl = mix(1., 2., floor(mod(uTime, 2.)));
              float scl = 1.;
              pos *= scl;
              // pos.x += .5;
              // vec4 modelPosition = modelMatrix * instanceMatrix * vec4(pos, 1.0);
              vec4 modelPosition = modelMatrix * vec4(pos * 1./uGrid * 2. + vec3(off,0.) * uDensity, 1.0);
              vec4 viewPosition = viewMatrix * modelPosition;
              vec4 projectedPosition = projectionMatrix * viewPosition;
              gl_Position = projectedPosition;
          
              vUv = uv;
              vS = s/smx;
              vScl = scl;
            }
          `
        }
        fragmentShader={
          /* glsl */ `
        uniform float uGrid;
            varying vec2 vUv;
            varying float vS;
            varying float vScl;
            uniform float uScale;

            void main() {
              // float d = smoothstep(.0 - mix(.001, .075, clamp(uGrid, 0., 60.)/60.), .5, length(vUv - .5));
              // float d = smoothstep(.25 - mix(.001, .075, clamp(uGrid, 0., 60.)/60.), .5, length(vUv - .5));
              float d = smoothstep(.25 / vScl - mix(.25 / vScl, .0, vS), .5 / vScl + mix(.0, 0., vS), length(vUv - .5));
              gl_FragColor = vec4(vec3(1.), 1.-d);
            }
          `
        }
        // uniforms={{ ...uniforms, uTime: new Uniform(0) }}
        uniforms={u}
        transparent={true}
        blending={AdditiveBlending}
      />
      {nodes.map((n) => {
        return (
          <Instance
            key={n.i}
            position={[n.p.x, n.p.y, 0]}
            scale={[n.r, n.r, 1]}
          />
        );
      })}
    </Instances>
  );
};

export default PatternSVG;
