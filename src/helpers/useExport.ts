import { useEffect, useRef, useCallback } from "react";
// import { useThree } from '@react-three/fiber'
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useThree } from "@react-three/fiber";
import { ExportObject } from "../components/Scene";
import useStore from "../store/store";
import { scaleCanvas } from "./useResize";
import { MathUtils, Mesh, ShaderMaterial, Texture, TextureLoader } from "three";
import JSZip from "jszip";
// import JSZip from 'jszip'
// import { useStore } from '../store/store.js'
// import { scaleCanvas } from './utils'
// import useProject from './useProject'
// import useStore from "../store/store";

// // import IconExport from '/icons/icon_export.svg'
// const typedArrayToBuffer = (array: Uint8Array): ArrayBuffer => {
//   return array.buffer.slice(
//     array.byteOffset,
//     array.byteLength + array.byteOffset
//   );
// };

interface Props {
  render: {
    deltaTime: number;
    frameCount: number;
    reset: boolean;
    exportPrep: boolean;
  } | null;
  renderScene: () => void;
}

const nearestHalfUp = (x: number) => {
  if (x < 0.5) return Math.ceil(x) - 0.5;
  else return Math.ceil(x);
};

const useExport = ({ render, renderScene }: Props): ExportObject => {
  // const image = useStore((state) => state.background.image)
  // const mode = useStore((state) => state.app.mode.primary)
  // const bubbleCount = useStore((state) => state.bubbles.count)
  // const animationDuration = useStore((state) => state.motion.duration)
  // const exportFps = useStore((state) => state.export.fps)
  // const exportSettings = useStore((state) => state.exportSettings);
  // const setExportSettings = useStore((state) => state.setExportSettings);
  const setValue = useStore((state) => state.setValue);
  const exportSettings = useStore((state) => state.exportSettings);
  const ffmpegLoaded = useStore((state) => state.ffmpegLoaded);
  const videoRef = useStore((state) => state.videoRef);
  const patternRef = useStore((state) => state.patternRef);
  const textRef = useStore((state) => state.textRef);
  const text = useStore((state) => state.text);
  const effectRef = useStore((state) => state.effectRef);
  const patternEffect = useStore((state) => state.patternEffect);
  const backgroundRef = useStore((state) => state.backgroundRef);
  const inputBackground = useStore((state) => state.inputBackground);
  const videoUpload = useStore((state) => state.videoUpload);
  const inputMode = useStore((state) => state.inputMode);
  const videoDuration = useStore((state) => state.videoDuration);
  const layout = useStore((state) => state.layout);

  // const { signal, abort } = useMemo(() => {
  //   const abortController = new AbortController();
  //   const signal = abortController.signal;
  //   const abort = () => abortController.abort();

  //   return { signal, abort };
  // }, []);

  // const modalExport = {
  //   title: 'Exporting assets',
  //   progress: 0,
  //   status: 'Preparing...',
  //   description:
  //     // eslint-disable-next-line quotes
  //     "Please don't change, reload, or close this browser tab while export is in progress",
  //   closeLabel: 'Cancel',
  //   onClose: async () => {
  //     setValue('export.cancelled', true)
  //     await cancel()
  //   },
  //   className: 'modal-export',
  //   icon: IconExport,
  // }

  // const test = () => {
  //   const speed = MathUtils.mapLinear(text.animationSpeed, 0, 1, 0.5, 2);

  //   const steps = 5;
  //   const ld = 1.5 / speed;
  //   const off = ((3 * 1.6 + 2 * 0.25) * ld) / 1.5;
  //   const textDuration = nearestHalfUp(off + steps * ld);

  //   const steps1 = 7;
  //   const ld1 = 1.5 / speed;
  //   const off1 = (3 * 0.25 * ld1) / 1.5;
  //   const textDuration1 = nearestHalfUp(off1 + steps1 * ld);
  //   const steps2 = 4;
  //   const ld2 = 1.5 / speed;
  //   const off2 = (1.5 * ld2) / 1.5;
  //   const textDuration2 = nearestHalfUp(off2 + steps2 * ld);

  //   console.log(textDuration, textDuration1, textDuration2);
  // };

  const getDuration = () => {
    // const exportDuration = Number((Math.round(videoDuration * 2) / 2).toFixed(1));
    // console.log(exportDuration);
    // if (format.typeRoot === "video" || format.sequence) {
    //   if (videoDuration !== null && videoDuration > 0) {
    //     frameCount = Math.min(
    //       Math.floor(exportFps * videoDuration),
    //       exportFps * videoDurationLimitSeconds
    //     );
    //   }

    const videoExport = format.typeRoot === "video" || format.sequence;

    if (!videoExport) return 0;

    const durationLimit = 20;

    // Video
    let vidDuration = 0;
    if (inputMode.value === 1 && videoExport) {
      vidDuration = videoDuration !== null ? videoDuration : 0;
    }

    // Text animation
    let textDuration = 0;
    if (text.mode.value === 2 && text.animating) {
      // console.log(text.animationSpeed);
      const speed = MathUtils.mapLinear(text.animationSpeed, 0, 1, 0.5, 2);

      if (text.layout.value === 0) {
        const steps = 5;
        const ld = 1.5 / speed;
        const off = ((3 * 1.6 + 2 * 0.25) * ld) / 1.5;
        textDuration = nearestHalfUp(off + steps * ld);
      } else if (text.layout.value === 1) {
        const steps = 7;
        const ld = 1.5 / speed;
        const off = (3 * 0.25 * ld) / 1.5;
        textDuration = nearestHalfUp(off + steps * ld);
      } else if (text.layout.value === 2) {
        const steps = 4;
        const ld = 1.5 / speed;
        const off = (1.5 * ld) / 1.5;
        textDuration = nearestHalfUp(off + steps * ld);
      }
    }

    // Pattern effect duration
    let effectDuration = 0;
    if (patternEffect.mode.value === 1 && patternEffect.animating) {
      if (patternEffect.style.value === 0) {
        const steps = 4;
        const ld = 1;
        const off = 0;
        effectDuration = nearestHalfUp(off + steps * ld);
      } else if (patternEffect.style.value === 1) {
        const steps = 4;
        const ld = 1.5;
        const off = 0.5;
        effectDuration = nearestHalfUp(off + steps * ld);
      } else if (patternEffect.style.value === 2) {
        const steps = 2;
        const ld = 1.5;
        const off = 1;
        effectDuration = nearestHalfUp(off + steps * ld);
      } else if (patternEffect.style.value === 3) {
        const steps = 4;
        const ld = 1;
        const off = 0.5;
        effectDuration = nearestHalfUp(off + steps * ld);
      }
    }

    // console.log(vidDuration, textDuration, effectDuration);
    const duration = Math.min(
      Math.max(vidDuration, textDuration, effectDuration),
      durationLimit
      // 1000
    );
    console.log("DURATION:", duration);

    return duration;
  };

  const timeout = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const modalExport = {
    title: "Exporting",
    progress: 0,
    status: "Preparing...",
    description:
      "Please don't change, reload, or close this browser tab while export is in progress",
    closeLabel: "Cancel Export",
    closeOnClick: async () => {
      setValue("exportCancelled", true);
      await cancel();
    },
  };

  // const { getProject } = useProject()

  // const zip = new JSZip()

  const stage = useRef(0);

  const ff = useRef<FFmpeg | null>(new FFmpeg());

  const zip = new JSZip();

  // const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const ffDir = "images";
  const filenamePrefix = "Omidyar_Network";

  const { gl } = useThree();

  // const frames = animationDuration.value * exportFps
  const format = exportSettings.format;
  const exportFps = 30;

  // const frameCount = useRef(1)
  // const videoDurationLimitSeconds = 10;
  // const exportDuration = Number((Math.round(videoDuration * 2) / 2).toFixed(1));
  // console.log(exportDuration);

  // let frameCount = 1;
  // if (format.typeRoot === "video" || format.sequence) {
  //   if (videoDuration !== null && videoDuration > 0) {
  //     frameCount = Math.min(
  //       Math.floor(exportFps * videoDuration),
  //       exportFps * videoDurationLimitSeconds
  //     );
  //   }
  // }

  // console.log(frameCount);
  // // const frames = exportFps * 1

  // // let layerCount = bubbleCount + 1 // include gradient background in layer export
  // // if (image[mode.label]) layerCount += 1 // include image in layer export (if present)

  const log = ({ type, message }: { type: string; message: string }) => {
    console.log(type, message);

    // const format = useStore.getState().export.format.value.split('/')[0]

    const frameCount = getDuration() * exportFps;

    if (message.includes("frame=")) {
      const f = message.indexOf("fps=");
      const fp = message.substring("frame=".length, f).trim();
      const progress = MathUtils.clamp(parseInt(fp) / frameCount, 0, 1);

      console.log(progress);

      let status = "";
      if (format.typeRoot === "video" || format.sequence) {
        if (stage.current === 1)
          status = `Converting video to frames (${Math.floor(
            progress * 100
          )}%)`;
        else status = `Creating MP4 (${Math.floor(progress * 100)}%)`;
      }

      setValue("modal", {
        ...modalExport,
        status,
        progress,
      });
    }
  };

  const options = {
    video: {
      type: "video/mp4",
      ext: "mp4",
      filename: `${filenamePrefix}.mp4`,
      // filename: filenamePrefix,
      exec: [
        "-framerate",
        `${exportFps}`,
        "-i",
        `${ffDir}/%d.png`,
        // '-s',
        // `${width}x${height}`, // size has to be divisible by 2 with libx264 / h264
        // '-c:v',
        // 'libx264',
        "-preset",
        "ultrafast",
        "-crf",
        "17",
        "-pix_fmt",
        "yuv420p",
        `${ffDir}/${filenamePrefix}.mp4`,
      ],
    },
    image: {
      type: "image/png",
      ext: "png",
      filename: `${filenamePrefix}.png`,
      // filename: filenamePrefix,
    },
  };

  const texture = useRef<Texture | null>(null);

  const ffOptions = options[format.typeRoot as keyof typeof options];

  // https://ffmpegwasm.netlify.app/docs/getting-started/usage/#transcoding-video
  // used this version after vite demo didn't work - caused hang on chrome - maybe due to multithread ??
  const download = async () => {
    // const setting = useStore.getState().export.format

    if (!format) return;

    if (!ff.current) return;

    if (useStore.getState().exportCancelled) return;

    if (
      inputMode.value === 1 &&
      (videoDuration === null || videoDuration === 0)
    ) {
      setValue("modal", {
        title: "Export Failed",
        description: "Video input duration is either 0 or not available",
      });

      return;
    }

    // calculateDuration();

    // Check formats and input mode
    // if inputmode === 0 or 3 and video or sequence return
    // if inputmode === 2 and camerastatus !== 2 return
    // Check video duration is not null and > 0

    // if (!setting || useStore.getState().export.exporting) return

    setValue("exportSettings", { ...exportSettings, exporting: true });

    setValue("modal", modalExport);

    // let fc = frameCount;
    const frameCount =
      format.typeRoot === "video" || format.sequence
        ? Math.floor(getDuration() * exportFps)
        : 1;

    if (render) render.exportPrep = true;

    // console.log("hello world");
    // return;

    // const layers = setting.layers || false
    // const background = setting.background || false
    // const image = setting.image || false
    // const bubbles =
    //   setting.bubbles !== undefined && typeof setting.bubbles === 'boolean'
    //     ? setting.bubbles
    //     : true
    // const sequence = setting.sequence || false
    // const code = setting.code || false

    // mode === motion and format === image do not set frameCount to 0
    // const bubbleMode = useStore.getState().bubbles.mode
    // render.current.keepFrame =
    //   bubbleMode.label === 'Motion' && format === 'image'

    // document.body.classList.add("exporting");

    // if (useStore.getState().export.cancelled) return
    if (useStore.getState().exportCancelled) return;

    scaleCanvas(layout, true, format.typeRoot);

    const ffmpeg = ff.current;

    // if (render) render.reset = false

    // // If video input mode pause video before export
    if (inputMode.value === 1 && videoRef) {
      // console.log(videoRef);
      // videoRef.pause();
      setValue("videoPaused", true);

      // If video or sequence export reseek video to zero
      if (format.typeRoot === "video" || format.sequence) {
        videoRef.currentTime = 0;
      }
      // return;
    }

    if (format.typeRoot === "video" || format.sequence) {
      setTime(0);
    }

    // renderScene();

    // render.current.reset = false
    // render.current.exportPrep = true
    // render.current.frameCount = 0
    //
    // setValue('app.modal', {
    //   ...modalExport,
    // })

    // const tsst1 = await ffmpeg.listDir("/");
    // console.log(tsst1);

    // Add timeout so canvas has time to resize before export begins
    await timeout(1000);

    if (render) render.exportPrep = false;

    // render.current.exportPrep = false

    // if (useStore.getState().export.cancelled) return
    if (useStore.getState().exportCancelled) return;

    setValue("modal", {
      ...modalExport,
      status: "Preparing export...",
    });

    const zerotime = performance.now();

    // if (useStore.getState().export.cancelled) return
    if (useStore.getState().exportCancelled) return;

    // Set listeners
    ffmpeg.on("log", log);

    // console.log("hello world");

    // if (useStore.getState().export.cancelled) return
    if (useStore.getState().exportCancelled) return;

    // const tsst = await ffmpeg.listDir("images");

    await ffmpeg.createDir(ffDir);

    // Extract frames from video input
    let videoFrameCount = 0;
    if (
      inputMode.value === 1 &&
      (format.typeRoot === "video" || format.sequence) &&
      videoUpload &&
      patternRef &&
      backgroundRef
    ) {
      // console.log(videoUpload);
      setValue("modal", {
        ...modalExport,
        status: "Converting video to frames (0%)",
      });

      stage.current = 1;
      await ffmpeg.createDir("video");
      await ffmpeg.createDir("video/frames");
      const videoFile = await fetchFile(videoUpload.url);
      await ffmpeg.writeFile("video/video.mp4", videoFile);
      await ffmpeg.exec([
        "-i",
        "video/video.mp4",
        "-vf",
        `fps=${exportFps}`,
        "video/frames/%0d.jpg",
      ]);
      const vfs = await ffmpeg.listDir("video/frames");
      videoFrameCount = vfs.filter((vf) => !vf.isDir).length;
      console.log("Video frames:", videoFrameCount);
      const data = await ffmpeg.readFile("video/frames/1.jpg");
      if (typeof data !== "string") {
        // const f = Float32Array.from(data)
        // const blob = new Blob([data.buffer], { type: "image/jpeg" });
        // const buffer = new Uint8Array(await blob.arrayBuffer());
        // const test = new TextureLoader().parse( data )
        const url = URL.createObjectURL(
          new Blob([data], { type: "image/jpeg" })
        );
        texture.current = await new TextureLoader().loadAsync(url);
        // console.log(url);
        texture.current.generateMipmaps = false;
        // texture = new DataTexture(data, 512, 512);
        // texture.needsUpdate = true;
        // console.log(texture);
        // patternRef.uniforms.uVideo.value = null;
        patternRef.uniforms.uExporting.value = 1;
        patternRef.uniforms.uExport.value = texture.current;
        if (inputBackground.value == 1) {
          backgroundRef.uniforms.uExporting.value = 1;
          backgroundRef.uniforms.uExport.value = texture.current;
        }
        // patternRef.uniforms.uVideo.value.needsUpdate = true;

        console.log(
          "Texture size:",
          texture.current.image.width,
          texture.current.image.height
        );
        // return;
        // return;
      }
      stage.current = 0;
    }

    if (useStore.getState().exportCancelled) return;
    // if (format === 'image') {
    //   await saveImages(
    //     1,
    //     layers ? layerCount : 1,
    //     { layers, background, image, bubbles },
    //     layers ? 'Saving layer: ' : 'Saving image: ',
    //     format
    //   )
    // } else if (format === 'video') {
    //   await saveImages(
    //     frames,
    //     layers ? layerCount : 1,
    //     { layers, background: !sequence, image },
    //     layers ? 'Saving layer: ' : 'Saving frame: ',
    //     format
    //   )

    //   // Convert images to video/gif
    //   if (!sequence) {
    //     setValue('app.modal', {
    //       ...modalExport,
    //       status: 'Creating MP4 (0%)',
    //     })
    //     await ffmpeg.exec(options[format].exec)
    //   }
    // }

    await saveImages(frameCount, texture.current, videoFrameCount);

    if (format.typeRoot === "video") {
      stage.current = 2;
      setValue("modal", {
        ...modalExport,
        status: "Creating MP4 (0%)",
      });
      await ffmpeg
        .exec(options[format.typeRoot].exec)
        // .exec(options[format.typeRoot].exec, undefined, { signal })
        .catch((err) => console.log(err.message));
      stage.current = 0;
    }

    // setValue('export.exporting', false)

    setValue("exportSettings", { ...exportSettings, exporting: false });

    // Reset canvas size
    // scaleCanvas()
    scaleCanvas(layout);

    // if (useStore.getState().export.cancelled) return
    if (useStore.getState().exportCancelled) return;

    // Download files
    if (format.sequence) {
      // Create zip of images if sequence (e.g. bubble layers in static or video sequence of animation)
      await createZip(frameCount);
    } else {
      const filename = `${filenamePrefix}_${new Date().toISOString()}.${
        ffOptions.ext
      }`;
      const filePath = `${ffDir}/${ffOptions.filename}`;
      const file = await ffmpeg.readFile(filePath);
      if (typeof file !== "string") {
        // FileData typeof Uint8Array | string
        const data = new Blob([file.buffer], { type: ffOptions.type });
        downloadFile(data, filename);
      }
    }

    // setValue('app.modal', {
    //   ...modalExport,
    //   progress: 1,
    //   status: 'Export complete',
    //   closeLabel: 'Close',
    // })

    // Delete ffmpeg files and directory
    // Note: moved delete files/dir here from cancel/cleanup else will interfere with async writing operation and can throw error which will prevent cancel. Will have to rely on ffmpeg.terminate to cancel - to do: check if terminate also clears files/dir
    // await deleteFiles()

    await cleanup();

    console.log("Total time:", (performance.now() - zerotime) / 1000);
  };

  const setTime = (time: number) => {
    if (textRef && text.animating) {
      textRef.children.forEach((child) => {
        const mesh = child as Mesh;
        const material = mesh.material as ShaderMaterial;
        material.uniforms.uTime.value = time;
      });
    }

    if (patternRef) {
      patternRef.uniforms.uTime.value = time;
    }

    if (effectRef && effectRef.uniforms.uEffect.value.z === 1) {
      effectRef.uniforms.uTime.value = time;
    }
  };

  const saveImages = async (
    frameCount = 1,
    texture: Texture | null,
    videoFrameCount: number = 0
  ) =>
    // frameCount = 1,
    // layerCount = 1,
    // canvasSettings = {
    //   layers: false,
    //   background: true,
    //   image: false,
    //   bubbles: true,
    //   layerIndex: 0,
    // },
    // status = '',
    // format = 'image'
    {
      // const ffmpeg = ff.current;
      if (!ff.current) return;

      // const layerSequence = format === 'video' && canvasSettings.layers
      // const lsTotal = bubbleCount * frameCount + (layerCount - bubbleCount)
      // let n = 1

      // await ffmpeg.createDir(ffDir);
      // for (let i = 0; i < layerCount; i++) {
      // if (canvasSettings.layers) await ffmpeg.createDir(`${ffDir}/layer_${i}`)
      // if (format === 'video') render.current.frameCount = 0
      // const dir = canvasSettings.layers ? `${ffDir}/layer_${i}` : `${ffDir}`

      // let fc = frameCount
      // if (canvasSettings.layers && i >= bubbleCount) fc = 1

      const status =
        format.typeRoot === "image" ? "Saving image: " : "Saving frame: ";

      for (let j = 0; j < frameCount; j++) {
        if (useStore.getState().exportCancelled) return;

        const exportStatus = `${status}${j + 1}/${frameCount}`;
        //   if (layerSequence) {
        //     exportStatus = `Saving Layer: ${i + 1}/${layerCount}, Frame: ${
        //       j + 1
        //     }/${fc}`
        //   } else if (canvasSettings.layers) {
        //     exportStatus = `${status}${i + 1}/${layerCount}`
        //   }

        if (format.typeRoot === "video" || format.sequence) {
          // const time = j / fc;
          const time = j / exportFps;
          setTime(time);
        }

        // If video input mode and video/sequence export send video frames as texture to scene
        if (
          (format.typeRoot === "video" || format.sequence) &&
          inputMode.value === 1 &&
          videoRef &&
          patternRef &&
          backgroundRef &&
          texture &&
          videoFrameCount > 0
        ) {
          //   // Update pattern input texture
          // texture.set()
          const frame = (j + 1) % videoFrameCount;
          const data = await ff.current.readFile(`video/frames/${frame}.jpg`);
          if (typeof data !== "string") {
            const url = URL.createObjectURL(
              new Blob([data], { type: "image/jpeg" })
            );
            texture.dispose();
            texture = await new TextureLoader().loadAsync(url);
            texture.generateMipmaps = false;
            patternRef.uniforms.uExport.value = texture;
            if (inputBackground.value == 1) {
              backgroundRef.uniforms.uExport.value = texture;
            }
            // await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }

        // Render manually each frame rather than in useFrame game-loop
        renderScene();

        // await timeout(100);
        //   //   const seeked = await new Promise((resolve)=>
        //   //     videoRef.addEventListener("seeked", () => resolve())
        //   // )

        //   // videoRef.addEventListener("seeked", (event) => {
        //   //   console.log(
        //   //     "Video found the playback position it was looking for.",
        //   //     videoRef.currentTime
        //   //   );
        //   // });

        //   if (videoDuration !== null && videoDuration > 0) {
        //     videoRef.currentTime = (j / fc) * videoDuration;
        //     console.log("seeking", (j / fc) * videoDuration);
        //     // console.log("seeking", );
        //   }
        // }

        const progress = (j + 1) / frameCount;
        //   if (layerSequence) progress = n / lsTotal
        //   else if (canvasSettings.layers) progress = n / layerCount

        setValue("modal", {
          ...modalExport,
          status: exportStatus,
          progress,
        });

        //   const settings = canvasSettings.layers
        //     ? { ...canvasSettings, layerIndex: i, layerSequence }
        //     : canvasSettings

        //   // Note: Firefox will block reading data from canvas if privacy.resistFingerprinting is enabled in browser config
        //   // https://support.mozilla.org/en-US/questions/1398931
        // const buffer = await saveCanvasImage();
        const blob: Blob = await new Promise((resolve) =>
          gl.domElement.toBlob((blob) => {
            if (blob) return resolve(blob);
            throw new Error("Error converting canvas to blob");
          })
        );
        const buffer = new Uint8Array(await blob.arrayBuffer());
        // return buffer;

        // console.log(buffer);
        // console.log("hello world");
        // const outFile = `${j}.png`;
        const outFile =
          format.typeRoot === "video" || format.sequence
            ? `${j}.png`
            : ffOptions.filename;

        console.log(`FFMPEG: ${exportStatus} ${ffDir}/${outFile}`);

        await ff.current.writeFile(`${ffDir}/${outFile}`, buffer);

        // if (format === 'video') render.current.frameCount++

        // n++
        // }
      }
    };

  // const saveCanvasImage = async () => {
  //   // if (layers) {
  //   //   renderLayers(layerIndex, layerSequence)
  //   // } else {
  //   //   renderExport(background, image, bubbles)
  //   // }
  //   // await new Promise((resolve) => setTimeout(resolve, 50))

  //   // Note: Firefox will block reading data from canvas if privacy.resistFingerprinting is enabled in browser config
  //   // https://support.mozilla.org/en-US/questions/1398931
  //   const blob = await new Promise((resolve) => gl.domElement.toBlob(resolve));
  //   const buffer = new Uint8Array(await blob.arrayBuffer());
  //   return buffer;
  //   // gl.domElement.toBlob((blob) => {
  //   //   if (!blob) return;
  //   //   blob.arrayBuffer().then((buffer) => {
  //   //     console.log(buffer);
  //   //   });
  //   // });
  // };

  // saveCanvasImage()

  const createZip = async (fc: number = 1) => {
    if (!ff.current) return;

    setValue("modal", { ...modalExport, status: "Creating ZIP file" });
    console.log("Creating ZIP file");

    for (let i = 0; i < fc; i++) {
      const blob = await ff.current.readFile(`${ffDir}/${i}.png`);
      const outPath = `${filenamePrefix}_${i}.png`;

      zip.file(outPath, blob);

      if (i === fc - 1) {
        const zipData = await zip.generateAsync({
          type: "blob",
          streamFiles: true,
        });

        downloadFile(
          zipData,
          `${filenamePrefix}_${new Date().toISOString()}.zip`
        );
      }
    }
  };

  const downloadFile = (data: Blob, filename: string) => {
    // setValue('app.modal', { ...modalExport, status: 'Downloading files' })
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cancel = async () => {
    if (!useStore.getState().exportSettings.exporting || !ff.current) return;

    // abort();

    // Run cleanup function
    await cleanup();

    // console.log("TERMINATING FFMPEG");

    // No exit functionality with @ffmpeg/ffmpeg so terminating and reloading
    ff.current.terminate();
    ff.current = null;
    ff.current = new FFmpeg();
    // console.log("FFMPEG = NEW", ff.current);
    setValue("ffmpegLoaded", false);

    // Re-load ffmpeg
    await load();
  };

  // TODO: check recursively (right now only checks one level deep for layer directories)
  const deleteFiles = async (dir: string = ffDir) => {
    if (!ff.current) return;

    // Check directory exists first
    const root = await ff.current.listDir("/");
    if (!root.find((p) => p.name === dir)) return;

    // Delete ffmpeg files and directory
    const result = await ff.current.listDir(dir);
    // console.log("RESULT", result);
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if ([".", ".."].includes(item.name)) continue;
      if (!item.isDir) {
        console.log(`FFMPEG: Deleting file: ${dir}/${item.name}`);
        await ff.current.deleteFile(`${dir}/${item.name}`);
      } else {
        const dirList = await ff.current.listDir(`${dir}/${item.name}`);
        for (let j = 0; j < dirList.length; j++) {
          const layerItem = dirList[j];
          if ([".", ".."].includes(layerItem.name)) continue;
          if (!layerItem.isDir) {
            console.log(
              `FFMPEG: Deleting file: ${dir}/${item.name}/${layerItem.name}`
            );
            await ff.current.deleteFile(
              `${dir}/${item.name}/${layerItem.name}`
            );
          }
        }
        console.log(`FFMPEG: Deleting directory: ${dir}/${item.name}`);
        await ff.current.deleteDir(`${dir}/${item.name}`);
      }
    }
    console.log(`FFMPEG: Deleting directory: ${dir}`);
    await ff.current.deleteDir(dir);
  };

  const cleanup = async () => {
    // if (render) {
    //   render.reset = true
    // }
    // render.current.frameCount = 0
    await deleteFiles(ffDir);

    if (
      inputMode.value === 1 &&
      (format.typeRoot === "video" || format.sequence)
    ) {
      await deleteFiles("video");
    }

    // Remove listeners
    if (ff.current) ff.current.off("log", log);

    if (
      inputMode.value === 1 &&
      (format.typeRoot === "video" || format.sequence) &&
      videoUpload &&
      patternRef &&
      backgroundRef
    ) {
      patternRef.uniforms.uExporting.value = 0;
      patternRef.uniforms.uExport.value = null;
      if (inputBackground.value == 1) {
        backgroundRef.uniforms.uExporting.value = 0;
        backgroundRef.uniforms.uExport.value = null;
      }

      if (texture.current) texture.current.dispose();
    }

    if (inputMode.value === 1 && videoRef) {
      // videoRef.play();
      setValue("videoPaused", false);
    }

    setValue("exportSettings", { ...exportSettings, exporting: false });
    setValue("modal", null);

    // setValue('app.modal', null)
    // setValue('export.exporting', false)

    // Reset canvas size (note this needs to be done after exporting value has been set to false)
    scaleCanvas(layout, false);

    // document.body.classList.remove("exporting");
  };

  // https://ffmpegwasm.netlify.app/docs/getting-started/usage/#transcoding-video
  // used this version after vite demo didn't work - caused hang on chrome - maybe due to multithread - this version doesn't include worker url in load
  const load = useCallback(async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm";
    // const ffmpeg = ff.current;
    if (!ff.current) return;

    // console.log("LOAD", ff.current);

    try {
      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.
      await ff.current.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      // setExport()
      // console.log("ffmpegloaded");
      setValue("ffmpegLoaded", true);
      // setFfmpegLoaded(true);
      setValue("exportCancelled", false);
      // setExportSettings({ ...exportSettings, ffmpegLoaded: true });
      // setValue('export.cancelled', false)
    } catch (error) {
      console.log(error);
    }
  }, [setValue]);

  useEffect(() => {
    load();
    const ffmpeg = ff.current;

    return () => {
      if (ffmpeg) {
        ffmpeg.terminate();
        // document.body.classList.remove("ffmpeg-loaded");
      }
    };
  }, [load]);

  useEffect(() => {
    if (ffmpegLoaded) {
      console.log("Loaded FFPMEG");
      // document.body.classList.add("ffmpeg-loaded");
      // setValue("ffmpegLoaded", true);
    } else {
      // document.body.classList.remove("ffmpeg-loaded");
    }
  }, [ffmpegLoaded, setValue]);

  return {
    ffmpegLoaded,
    download,
    // cancel,
  };
};

export default useExport;
