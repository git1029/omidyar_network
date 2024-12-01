import { useEffect, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useThree } from "@react-three/fiber";
import { ExportObject } from "../components/Scene";
import useStore from "../store/store";
import { scaleCanvas } from "./useResize";
import { MathUtils, Mesh, ShaderMaterial, Texture, TextureLoader } from "three";
import JSZip from "jszip";

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

  const getDuration = () => {
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

  const stage = useRef(0);

  const ff = useRef<FFmpeg | null>(new FFmpeg());

  const zip = new JSZip();

  const ffDir = "images";
  const filenamePrefix = "Omidyar_Network";

  const { gl } = useThree();

  const format = exportSettings.format;
  const exportFps = 30;

  const log = ({ type, message }: { type: string; message: string }) => {
    console.log(type, message);

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
    },
  };

  const texture = useRef<Texture | null>(null);

  const ffOptions = options[format.typeRoot as keyof typeof options];

  // https://ffmpegwasm.netlify.app/docs/getting-started/usage/#transcoding-video
  // used this version after vite demo didn't work - caused hang on chrome - maybe due to multithread ??
  const download = async () => {
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

    setValue("exportSettings", { ...exportSettings, exporting: true });

    setValue("modal", modalExport);

    const frameCount =
      format.typeRoot === "video" || format.sequence
        ? Math.floor(getDuration() * exportFps)
        : 1;

    if (render) render.exportPrep = true;

    if (useStore.getState().exportCancelled) return;

    scaleCanvas(layout, true, format.typeRoot);

    const ffmpeg = ff.current;

    // // If video input mode pause video before export
    if (inputMode.value === 1 && videoRef) {
      setValue("videoPaused", true);

      // If video or sequence export reseek video to zero
      if (format.typeRoot === "video" || format.sequence) {
        videoRef.currentTime = 0;
      }
    }

    if (format.typeRoot === "video" || format.sequence) {
      setTime(0);
    }

    // Add timeout so canvas has time to resize before export begins
    await timeout(1000);

    if (render) render.exportPrep = false;

    if (useStore.getState().exportCancelled) return;

    setValue("modal", {
      ...modalExport,
      status: "Preparing export...",
    });

    const zerotime = performance.now();

    if (useStore.getState().exportCancelled) return;

    // Set listeners
    ffmpeg.on("log", log);

    if (useStore.getState().exportCancelled) return;

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
        "video/frames/%0d.png",
      ]);
      const vfs = await ffmpeg.listDir("video/frames");
      videoFrameCount = vfs.filter((vf) => !vf.isDir).length;
      console.log("Video frames:", videoFrameCount);
      const data = await ffmpeg.readFile("video/frames/1.png");
      if (typeof data !== "string") {
        const url = URL.createObjectURL(
          new Blob([data], { type: "image/png" })
        );
        texture.current = await new TextureLoader().loadAsync(url);
        texture.current.generateMipmaps = false;
        patternRef.uniforms.uExporting.value = 1;
        patternRef.uniforms.uExport.value = texture.current;
        if (inputBackground.value == 1) {
          backgroundRef.uniforms.uExporting.value = 1;
          backgroundRef.uniforms.uExport.value = texture.current;
        }

        console.log(
          "Texture size:",
          texture.current.image.width,
          texture.current.image.height
        );
      }
      stage.current = 0;
    }

    if (useStore.getState().exportCancelled) return;

    await saveImages(frameCount, texture.current, videoFrameCount);

    if (format.typeRoot === "video") {
      stage.current = 2;
      setValue("modal", {
        ...modalExport,
        status: "Creating MP4 (0%)",
      });
      await ffmpeg
        .exec(options[format.typeRoot].exec)
        .catch((err) => console.log(err.message));
      stage.current = 0;
    }

    setValue("exportSettings", { ...exportSettings, exporting: false });

    // Reset canvas size
    scaleCanvas(layout);

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
  ) => {
    if (!ff.current) return;

    const status =
      format.typeRoot === "image" ? "Saving image: " : "Saving frame: ";

    for (let j = 0; j < frameCount; j++) {
      if (useStore.getState().exportCancelled) return;

      const exportStatus = `${status}${j + 1}/${frameCount}`;

      if (format.typeRoot === "video" || format.sequence) {
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
        // Update pattern input texture
        const frame = (j + 1) % videoFrameCount;
        const data = await ff.current.readFile(`video/frames/${frame}.png`);
        if (typeof data !== "string") {
          const url = URL.createObjectURL(
            new Blob([data], { type: "image/png" })
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

      const progress = (j + 1) / frameCount;

      setValue("modal", {
        ...modalExport,
        status: exportStatus,
        progress,
      });

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

      const outFile =
        format.typeRoot === "video" || format.sequence
          ? `${j}.png`
          : ffOptions.filename;

      console.log(`FFMPEG: ${exportStatus} ${ffDir}/${outFile}`);

      await ff.current.writeFile(`${ffDir}/${outFile}`, buffer);
    }
  };

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
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cancel = async () => {
    if (!useStore.getState().exportSettings.exporting || !ff.current) return;

    // Run cleanup function
    await cleanup();

    // No exit functionality with @ffmpeg/ffmpeg so terminating and reloading
    ff.current.terminate();
    ff.current = null;
    ff.current = new FFmpeg();
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
      setValue("videoPaused", false);
    }

    setValue("exportSettings", { ...exportSettings, exporting: false });
    setValue("modal", null);

    // Reset canvas size (note this needs to be done after exporting value has been set to false)
    scaleCanvas(layout, false);
  };

  // https://ffmpegwasm.netlify.app/docs/getting-started/usage/#transcoding-video
  // used this version after vite demo didn't work - caused hang on chrome - maybe due to multithread - this version doesn't include worker url in load
  const load = useCallback(async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm";
    if (!ff.current) return;

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

      setValue("ffmpegLoaded", true);
      setValue("exportCancelled", false);
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
      }
    };
  }, [load]);

  useEffect(() => {
    if (ffmpegLoaded) {
      console.log("Loaded FFPMEG");
    }
  }, [ffmpegLoaded, setValue]);

  return {
    ffmpegLoaded,
    download,
    // cancel,
  };
};

export default useExport;
