import {
  // Instance,
  // Instances,
  OrthographicCamera,
  // Text,
  useFBO,
  useTexture,
  useVideoTexture,
  // useTexture,
  // useVideoTexture,
} from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
// import { useMemo } from "react";
// import { AdditiveBlending } from "three";
// import useNodes from "./useNodes";
import {
  // AdditiveBlending,
  Points,
  Scene,
  ShaderMaterial,
  Uniform,
  Vector2,
  // OrthographicCamera,
} from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";

// interface Node {
//   i: number;
//   p: Vector2;
//   r: number;
// }

const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute float aIndex;
  uniform float uGrid;
  uniform vec2 uViewport;
  uniform vec2 uResolution;
  uniform sampler2D uImage;
  varying float vB;
  varying float id;


   
  vec4 brightness(vec3 color) {
    float b = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
    vec3 c = color;
    // if (uInvert == 1.) {
    //   b = 1. - b;
    //   c = 1. - c;
    // }
    return vec4(c, clamp(b, 0., 1.));
  }

  void main() {
    // vec3 particlePosition = position;

    // float x = mod(aIndex, uGrid) / uGrid - .5;
    // float y = floor(aIndex / uGrid) / uGrid - .5;

    // vec3 pos = vec3(x, y, 0.);
    // pos.xy += vec2(.5)/uGrid;



    vec4 b = brightness(texture(uImage, position.xy + .5).rgb);

    vec3 pos = position;

    // if (aIndex == 1.) pos.x += 1./uGrid*.5 * b.w;
    // if (aIndex == 2.) pos.y += 1./uGrid*.5 * b.w;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    float s = 1.;
    // if (aIndex == 1.) s = 1.25;
    if (pos.x >= .5) s = 0.;
    if (pos.y >= .5) s = 0.;

    gl_Position = projectedPosition;
    gl_PointSize = uResolution.x * 1./uGrid * .5 * s * smoothstep(.15, 1., b.w) * 2.;
    // if (aIndex == 0.) gl_PointSize *= 1.5;

    vB = b.w;
    id = aIndex;

    // gl_PointSize *= (1.0 / - viewPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
varying float vB;
varying float id;
  void main() {
    
    float d = 0.;
    if (id == 0.) {
       d = distance(gl_PointCoord, vec2(0.5));
       d = 1. - d;
       d = smoothstep(.6, .9, d);
      //  d = step(.5, d);
      //  d = 0.;
    } 
    else if (id == 1.) {
      d = smoothstep(.6, .9, (1.-abs(gl_PointCoord.y * 2. - 1.) * 1.) * .85);
      // // d = 0.;
      // // d *= smoothstep(.0, .25, (1.-abs(gl_PointCoord.x * 2. - 1.)));
      d *= mix(sin(gl_PointCoord.x * 3.14159), smoothstep(.0, .25, (1.-abs(gl_PointCoord.x * 2. - 1.))), vB);

      // d = smoothstep(.6, .9, (1.-abs(gl_PointCoord.y * 2. - 1.) * 1.) * mix(.7, .9, vB));
      // d *= smoothstep(mix(1., 0., vB), mix(.5, 1., vB), 1.-gl_PointCoord.x);
    }
    else if (id == 2.) {
      d = smoothstep(.6, .9, (1.-abs(gl_PointCoord.x * 2. - 1.) * 1.) * .85);
      d *= mix(sin(gl_PointCoord.x * 3.14159), smoothstep(.0, .25, (1.-abs(gl_PointCoord.y * 2. - 1.))), vB);
    }
    gl_FragColor = vec4(vec3(1.),d);
  }
`;

const PatternScene = ({ grid }: { grid: number }) => {
  const points = useRef<Points>(null);
  const pointsMat = useRef<ShaderMaterial>(null);

  const { viewport, size } = useThree();

  // console.log(size);

  const img = useTexture("/img.jpg");
  const video = useVideoTexture("/footage.mp4");

  const [position, index] = useMemo(() => {
    const count = grid * grid;
    // Create a Float32Array of count*3 length
    // -> we are going to generate the x, y, and z values for 2000 particles
    // -> thus we need 6000 items in this array
    const n = 3;
    const positions = new Float32Array(count * 3 * n);
    const index = new Float32Array(count * 1 * n);

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < count; i++) {
        index[i + j * count] = j;
      }
    }

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < count; i++) {
        // Generate random values for x, y, and z on every loop
        // const x = (Math.random() - 0.5) * 2;
        // const y = (Math.random() - 0.5) * 2;
        // const z = (Math.random() - 0.5) * 2;
        let x = (i % grid) / grid - 0.5 + 0.5 / grid;
        let y = Math.floor(i / grid) / grid - 0.5 + 0.5 / grid;
        const z = 0;

        if (j === 1) x += 0.5 / grid;
        if (j === 2) y += 0.5 / grid;

        // We add the 3 values to the attribute array for every loop
        positions.set([x, y, z], i * 3 + j * count * 3);
      }
    }

    console.log(positions);
    console.log(index);

    return [positions, index];
  }, [grid]);

  const uniforms = useMemo(
    () => ({
      uTime: new Uniform(0),
      uGrid: new Uniform(grid),
      uViewport: new Uniform(new Vector2(10, 10)),
      uResolution: new Uniform(new Vector2(10, 10)),
      uImage: new Uniform(null),
      // Add any other attributes here
    }),
    []
  );

  // useEffect(() => {
  //   if (pointsMat.current) {
  //     pointsMat.current.uniforms.uGrid.value = grid;
  //   }
  // }, [grid]);

  useEffect(() => {
    if (pointsMat.current) {
      pointsMat.current.uniforms.uViewport.value.set(
        viewport.width,
        viewport.height
      );
    }
  }, [viewport, pointsMat]);

  useEffect(() => {
    if (pointsMat.current) {
      pointsMat.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size, pointsMat]);

  useEffect(() => {
    // console.log(img);
    if (pointsMat.current && img) {
      // img.minFilter = LinearFilter;
      // img.magFilter = LinearFilter;
      // img.anisotropy = 8;
      img.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      // img.wrapS = RepeatWrapping;
      // img.wrapT = RepeatWrapping;
      // img.flipY = false;
      img.needsUpdate = true;
      pointsMat.current.uniforms.uImage.value = img;
    }
  }, [img]);

  useEffect(() => {
    if (pointsMat.current && video) {
      // console.log(video);
      video.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
      // imgtest.wrapS = RepeatWrapping;
      // imgtest.wrapT = RepeatWrapping;
      // imgtest.flipY = false;
      video.needsUpdate = true;

      // video.image.play();

      // const vf = new VideoFrame(video.image as HTMLVideoElement);
      // console.log(vf);
      // if (test.current) {
      //   test.current.map = new Texture(vf);
      //   test.current.needsUpdate = true;
      // }
      // video.image.play();
      // (video.image as HTMLVideoElement).requestVideoFrameCallback(
      //   (now, metadata) => {
      //     console.log(now, metadata);
      //   }
      // );
      // video.needsUpdate = false;
      pointsMat.current.uniforms.uImage.value = video;
    }
  }, [video]);

  useFrame((_state, delta) => {
    if (pointsMat.current) {
      pointsMat.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <>
      {/* <OrthographicCamera
        near={-1}
        far={1}
        left={-0.5}
        right={0.5}
        top={0.5}
        bottom={-0.5}
        manual
        makeDefault
      /> */}
      {/* <mesh scale={[0.9, 0.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshNormalMaterial />
      </mesh> */}
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={position.length / 3}
            array={position}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aIndex"
            count={index.length / 1}
            array={index}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={pointsMat}
          depthWrite={false}
          depthTest={false}
          transparent={true}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          // blending={AdditiveBlending}
        />
      </points>
    </>
  );
};

const PatternSVG = () => {
  const { gl, camera } = useThree();

  const grid = 20;

  const [scene] = useState(new Scene());
  // const [camera] = useState(new OrthographicCamera(-1, 1, 1, 1, -1, 1));

  const target = useFBO(512 * 2, 512 * 2);

  useFrame(() => {
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    // target.texture.needsUpdate = true;
    gl.setRenderTarget(null);
  });

  return (
    <>
      <OrthographicCamera
        near={-1}
        far={1}
        left={-0.5}
        right={0.5}
        top={0.5}
        bottom={-0.5}
        manual
        makeDefault
      />
      {createPortal(<PatternScene grid={grid} />, scene)}
      <mesh scale={[1, 1, 1]} visible={true}>
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
              // vec4 c = texture(uImage, vUv);

              // vec2 iResolution = vec2(1000.);

              // float Pi = 6.28318530718; // Pi*2
    
              // // GAUSSIAN BLUR SETTINGS {{{
              // float Directions = 8.0; // BLUR DIRECTIONS (Default 16.0 - More is better but slower)
              // float Quality = 12.0; // BLUR QUALITY (Default 4.0 - More is better but slower)
              // float Size = 10.0; // BLUR SIZE (Radius)
              // // GAUSSIAN BLUR SETTINGS }}}
             
              // vec2 Radius = Size/iResolution.xy;
              
              // // Normalized pixel coordinates (from 0 to 1)
              // // vec2 uv = vUv;
              // // Pixel colour
              // vec4 Color = texture(uImage, vUv);
              
              // // Blur calculations
              // for( float d=0.0; d<Pi; d+=Pi/Directions)
              // {
              // for(float i=1.0/Quality; i<=1.0; i+=1.0/Quality)
              //     {
              //   Color += texture( uImage, vUv+vec2(cos(d),sin(d))*Radius*i);		
              //     }
              // }
              
              // // Output to screen
              // Color /= Quality * Directions - 15.0;
              // fragColor =  Color;

              
              // Color.rgb = smoothstep(.75, 1., Color.rgb);
              // cc = mix(vec4(vec3(0.), 1.), cc, c.r);

              vec4 cc = texture(uImage, vUv);
              float gg = min(max(2., uGrid), 30.)/30.;
              gl_FragColor = vec4(mix(vec3(0.), vec3(1.), smoothstep(.475 - .1*gg, .525 + .1*gg, cc.r)), 1.);
              // gl_FragColor = vec4(1., 0., 0., 1.);
              #include <colorspace_fragment>
            }
          `
          }
          transparent={true}
          uniforms={{
            uImage: new Uniform(target.texture),
            uGrid: new Uniform(grid),
          }}
        />
      </mesh>

      {/* <Text
        fontSize={0.25}
        maxWidth={1}
        overflowWrap="break-word"
        scale={[1, viewport.aspect, 1]}
      >
        Hellowo rld
      </Text> */}
    </>
  );
};

// const PatternSVG = () => {
//   // const { viewport } = useThree();

//   // const tex = useTexture("/download.png");

//   // const [grid, uniforms] = useMemo(() => {
//   //   const grid = 10;
//   //   const uniforms = {
//   //     uGrid: new Uniform(grid),
//   //   };
//   //   return [grid, uniforms];
//   // }, []);

//   // const nodes: Node[] = useMemo(() => {
//   //   const nodes = [];
//   //   for (let i = 0; i < grid * grid; i++) {
//   //     const x = i % grid;
//   //     const y = Math.floor(i / grid);
//   //     const r = viewport.width / grid;
//   //     const p = new Vector2(
//   //       (x / grid - 0.5) * viewport.width + (viewport.width / grid) * 0.5,
//   //       (y / grid - 0.5) * viewport.height + (viewport.height / grid) * 0.5
//   //     );

//   //     const neighbours = [];
//   //     for (let j = -1; j <= 1; j++) {
//   //       for (let k = -1; k <= 1; k++) {
//   //         if (j === 0 && k === 0) continue;
//   //         const x_ = x + j;
//   //         const y_ = y + k;
//   //         if (x_ < 0 || x_ >= grid || y_ < 0 || y_ >= grid) continue;
//   //         const i = x_ + y_ * grid;
//   //         let dir = "";
//   //         if (j === -1 && k === -1) dir = "tl";
//   //         if (j === 0 && k === -1) dir = "t";
//   //         if (j === 1 && k === -1) dir = "tr";
//   //         if (j === 1 && k === 0) dir = "r";
//   //         if (j === 1 && k === 1) dir = "br";
//   //         if (j === 0 && k === 1) dir = "b";
//   //         if (j === -1 && k === 1) dir = "bl";
//   //         if (j === -1 && k === 0) dir = "l";
//   //         neighbours.push({ node: i, dir });
//   //       }
//   //     }

//   //     nodes.push({ i, p, r, neighbours });
//   //   }

//   //   console.log(nodes);
//   //   return nodes;
//   // }, [viewport, grid]);

//   const { viewport, gl, camera } = useThree();

//   const [scene] = useState(new Scene());

//   const target = useFBO(512 * 1, 512 * 1);

//   useFrame(() => {
//     gl.setRenderTarget(target);
//     gl.render(scene, camera);
//     // target.texture.needsUpdate = true;
//     gl.setRenderTarget(null);
//   });

//   return (
//     <>
//       {createPortal(<PatternScene />, scene)}
//       <mesh scale={[viewport.width, viewport.height, 1]}>
//         <planeGeometry args={[1, 1]} />
//         <shaderMaterial
//           vertexShader={
//             /* glsl */ `
//             varying vec2 vUv;

//             void main() {
//               vec4 modelPosition = modelMatrix * vec4(position, 1.0);
//               vec4 viewPosition = viewMatrix * modelPosition;
//               vec4 projectedPosition = projectionMatrix * viewPosition;
//               gl_Position = projectedPosition;

//               vUv = uv;
//             }
//           `
//           }
//           fragmentShader={
//             /* glsl */ `
//         uniform float uGrid;
//             varying vec2 vUv;
//             uniform sampler2D uImage;

//             void main() {
//               vec4 c = texture(uImage, vUv);
//               vec4 cc = vec4(smoothstep(.75, .85, c.rgb), 1.);
//               // cc = mix(vec4(vec3(0.), 1.), cc, c.r);
//               gl_FragColor = cc;
//             }
//           `
//           }
//           transparent={true}
//           uniforms={{
//             uImage: new Uniform(target.texture),
//           }}
//         />
//       </mesh>
//     </>
//   );
// };

// const PatternScene = () => {
//   const grid = 30;
//   const { nodes } = useNodes(grid);

//   const { viewport } = useThree();

//   const ref = useRef<ShaderMaterial>(null);

//   // const vid = useVideoTexture("/footage.mp4");
//   const vid = useTexture("/img.jpg");

//   useFrame((_state, delta) => {
//     if (ref.current) {
//       ref.current.uniforms.uTime.value += delta;
//     }
//   });

//   // const u = useMemo(() => {

//   // })

//   const u = useMemo(() => {
//     return {
//       uTime: new Uniform(0),
//       uVideo: new Uniform(null),
//       uViewport: new Uniform(new Vector2(1, 1)),
//       uScale: new Uniform(1),
//       uGrid: new Uniform(grid),
//     };
//   }, []);

//   useEffect(() => {
//     if (ref.current) {
//       ref.current.uniforms.uVideo.value = vid;
//     }
//   }, [vid]);

//   useEffect(() => {
//     if (ref.current) {
//       ref.current.uniforms.uViewport.value.set(viewport.width, viewport.height);
//     }
//   }, [viewport]);

//   // console.log(uniforms);
//   if (!nodes) return null;

//   return (
//     <Instances limit={60 * 60} visible={true}>
//       <planeGeometry args={[1, 1]} />
//       <shaderMaterial
//         ref={ref}
//         vertexShader={
//           /* glsl */ `
//             varying vec2 vUv;
//             varying float vS;
//             varying float vScl;
//             uniform float uTime;
//             uniform sampler2D uVideo;
//             uniform vec2 uViewport;
//             uniform float uGrid;
//             // uniform float uScale;

//             void main() {
//               vec3 pos = position;
//               vec2 off = (modelMatrix * instanceMatrix * vec4(0., 0., 0., 1.)).xy; // get circle instance position

//               float uDensity = 1.;
//               // p *= uDensity;
//               float smx = 3.;
//               vec2 uvs = off.xy/uViewport + .5;
//               float c = texture(uVideo, uvs).r;
//               if (c < .1) c = 0.;
//               // pos *= mix(1., 3., sin(uTime + float(gl_InstanceID) * 0. + uv.x) * .5 + .5);
//               float s = mix(.0, smx, c);
//               pos *= s;
//               // float scl = mix(1., 2., floor(mod(uTime, 2.)));
//               float scl = 1.;
//               pos *= scl;
//               // pos.x += .5;
//               // vec4 modelPosition = modelMatrix * instanceMatrix * vec4(pos, 1.0);
//               vec4 modelPosition = modelMatrix * vec4(pos * 1./uGrid * 2. + vec3(off,0.) * uDensity, 1.0);
//               vec4 viewPosition = viewMatrix * modelPosition;
//               vec4 projectedPosition = projectionMatrix * viewPosition;
//               gl_Position = projectedPosition;

//               vUv = uv;
//               vS = s/smx;
//               vScl = scl;
//             }
//           `
//         }
//         fragmentShader={
//           /* glsl */ `
//         uniform float uGrid;
//             varying vec2 vUv;
//             varying float vS;
//             varying float vScl;
//             uniform float uScale;

//             void main() {
//               // float d = smoothstep(.0 - mix(.001, .075, clamp(uGrid, 0., 60.)/60.), .5, length(vUv - .5));
//               // float d = smoothstep(.25 - mix(.001, .075, clamp(uGrid, 0., 60.)/60.), .5, length(vUv - .5));
//               float d = smoothstep(.25 / vScl - mix(.25 / vScl, .0, vS), .5 / vScl + mix(.0, 0., vS), length(vUv - .5));
//               gl_FragColor = vec4(vec3(1.), 1.-d);
//             }
//           `
//         }
//         // uniforms={{ ...uniforms, uTime: new Uniform(0) }}
//         uniforms={u}
//         transparent={true}
//         blending={AdditiveBlending}
//       />
//       {nodes.map((n) => {
//         return (
//           <Instance
//             key={n.i}
//             position={[n.p.x, n.p.y, 0]}
//             scale={[n.r, n.r, 1]}
//           />
//         );
//       })}
//     </Instances>
//   );
// };

export default PatternSVG;
