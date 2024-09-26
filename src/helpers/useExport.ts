import { useEffect, useRef, useCallback, useState } from "react";
// import { useThree } from '@react-three/fiber'
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { useThree } from "@react-three/fiber";
import { ExportObject } from "../components/Scene";
import useStore from "../store/store";
import { scaleCanvas } from "./useResize";
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

const useExport = (): ExportObject => {
  // const image = useStore((state) => state.background.image)
  // const mode = useStore((state) => state.app.mode.primary)
  // const bubbleCount = useStore((state) => state.bubbles.count)
  // const animationDuration = useStore((state) => state.motion.duration)
  // const exportFps = useStore((state) => state.export.fps)
  // const exportSettings = useStore((state) => state.exportSettings);
  // const setExportSettings = useStore((state) => state.setExportSettings);
  // const setValue = useStore((state) => state.setValue)
  const exportSettings = useStore((state) => state.exportSettings);
  const videoDuration = useStore((state) => state.videoDuration);
  const layout = useStore((state) => state.layout);

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

  // const { getProject } = useProject()

  // const zip = new JSZip()

  const ff = useRef(new FFmpeg());

  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const ffDir = "images";
  const filenamePrefix = `Omidyar_Network_${new Date().toISOString()}`;

  const { gl } = useThree();

  // const frames = animationDuration.value * exportFps
  const format = exportSettings.format.typeRoot;
  const exportFps = 30;
  const videoDurationLimitSeconds = 10;
  // const exportDuration = Number((Math.round(videoDuration * 2) / 2).toFixed(1));
  // console.log(exportDuration);
  const frameCount =
    format === "image"
      ? 1
      : Math.min(
          Math.floor(exportFps * videoDuration),
          exportFps * videoDurationLimitSeconds
        );
  // console.log(frameCount);
  // // const frames = exportFps * 1

  // // let layerCount = bubbleCount + 1 // include gradient background in layer export
  // // if (image[mode.label]) layerCount += 1 // include image in layer export (if present)

  const log = ({ type, message }: { type: string; message: string }) => {
    console.log(type, message);

    // const format = useStore.getState().export.format.value.split('/')[0]

    if (message.includes("frame=")) {
      const f = message.indexOf("fps=");
      const fp = message.substring("frame=".length, f).trim();
      const progress = parseInt(fp) / frameCount;

      console.log(progress);

      // setValue('app.modal', {
      //   ...modalExport,
      //   status:
      //     format === 'video'
      //       ? `Creating MP4 (${Math.floor(progress * 100)}%)`
      //       : '',
      //   progress,
      // })
    }
  };

  const options = {
    video: {
      type: "video/mp4",
      ext: "mp4",
      filename: `${filenamePrefix}.mp4`,
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

  const ffOptions = options[format as keyof typeof options];

  // https://ffmpegwasm.netlify.app/docs/getting-started/usage/#transcoding-video
  // used this version after vite demo didn't work - caused hang on chrome - maybe due to multithread ??
  const download = async () => {
    // const setting = useStore.getState().export.format

    // if (!setting || useStore.getState().export.exporting) return

    // setValue('export.exporting', true)

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

    document.body.classList.add("exporting");

    // if (useStore.getState().export.cancelled) return

    scaleCanvas(layout, true, format);

    // render.current.reset = false
    // render.current.exportPrep = true
    // render.current.frameCount = 0
    //
    // setValue('app.modal', {
    //   ...modalExport,
    // })

    // Add timeout so canvas has time to resize before export begins
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // render.current.exportPrep = false

    // if (useStore.getState().export.cancelled) return

    const zerotime = performance.now();

    // setValue('app.modal', {
    //   ...modalExport,
    //   status: 'Starting export',
    // })

    const ffmpeg = ff.current;

    // if (useStore.getState().export.cancelled) return

    // Set listeners
    ffmpeg.on("log", log);

    // console.log("hello world");

    // if (useStore.getState().export.cancelled) return

    await ffmpeg.createDir(ffDir);

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

    await saveImages();

    if (format === "video") {
      //     setValue('app.modal', {
      //       ...modalExport,
      //       status: 'Creating MP4 (0%)',
      //     })
      await ffmpeg.exec(options[format].exec);
    }

    // setValue('export.exporting', false)

    // Reset canvas size
    // scaleCanvas()
    scaleCanvas(layout);

    // if (useStore.getState().export.cancelled) return

    // // Download files
    // if (sequence) {
    //   // Create zip of images if sequence (e.g. bubble layers in static or video sequence of animation)
    //   const name = layers ? 'Layer' : 'Frame'
    //   const prefix = `O2_Bubble_${name}`
    //   await createZip(
    //     code,
    //     format === 'video' ? frames : 1,
    //     layers ? layerCount : 1,
    //     layers,
    //     prefix,
    //     `${prefix}s`,
    //     format
    //   )
    // } else {
    //   const filename =
    //     format === 'image'
    //       ? `0.${options[format].ext}`
    //       : options[format].filename
    //   const filePath = `${ffDir}/${filename}`

    //   setValue('app.modal', {
    //     ...modalExport,
    //     status: 'Downloading files',
    //   })
    //   const file = await ffmpeg.readFile(filePath)
    //   const data = new Blob([file.buffer], { type: options[format].type })
    //   downloadFile(data, options[format].filename)
    // }

    const filename = ffOptions.filename;
    const filePath = `${ffDir}/${filename}`;
    const file = await ffmpeg.readFile(filePath);
    if (typeof file !== "string") {
      // FileData typeof Uint8Array | string
      const data = new Blob([file.buffer], { type: ffOptions.type });
      downloadFile(data, filename);
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

  const saveImages = async () =>
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
      const ffmpeg = ff.current;

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

      for (let j = 0; j < frameCount; j++) {
        //   let exportStatus = `${status}${j + 1}/${fc}`
        //   if (layerSequence) {
        //     exportStatus = `Saving Layer: ${i + 1}/${layerCount}, Frame: ${
        //       j + 1
        //     }/${frameCount}`
        //   } else if (canvasSettings.layers) {
        //     exportStatus = `${status}${i + 1}/${layerCount}`
        //   }

        //   let progress = n / fc
        //   if (layerSequence) progress = n / lsTotal
        //   else if (canvasSettings.layers) progress = n / layerCount

        //   setValue('app.modal', {
        //     ...modalExport,
        //     status: exportStatus,
        //     progress,
        //   })
        //   console.log(`FFMPEG: ${exportStatus} ${dir}/${j}.png`)

        //   const settings = canvasSettings.layers
        //     ? { ...canvasSettings, layerIndex: i, layerSequence }
        //     : canvasSettings

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
        const outFile = format === "video" ? `${j}.png` : ffOptions.filename;

        await ffmpeg.writeFile(`${ffDir}/${outFile}`, buffer);

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

  // const createZip = async (
  //   code = false,
  //   frameCount = 1,
  //   layerCount = 1,
  //   layers = false,
  //   prefix = 'O2_Bubble',
  //   outFilePrefix = 'O2_Bubble',
  //   format = 'image'
  // ) => {
  //   const ffmpeg = ff.current

  //   setValue('app.modal', { ...modalExport, status: 'Creating ZIP file' })
  //   console.log('Creating ZIP file')

  //   const layerSequence = format === 'video' && layers

  //   for (let i = 0; i < layerCount; i++) {
  //     const dir = layers ? `${ffDir}/layer_${i}` : `${ffDir}` // ffmpeg directory to read from
  //     const zipDir = `O2_Bubble_Layer_${i}`
  //     if (layerSequence) zip.folder(zipDir)
  //     const fc = layers && i >= bubbleCount ? 1 : frameCount

  //     for (let j = 0; j < fc; j++) {
  //       const blob = await ffmpeg.readFile(`${dir}/${j}.png`)

  //       let outPath = `${prefix}_${j}.png`
  //       if (i < bubbleCount) {
  //         if (layerSequence) outPath = `${zipDir}/${j}.png`
  //         else if (layers) outPath = `${prefix}_${i}.png`
  //       } else if (i === bubbleCount) outPath = `${prefix}_Background.png`
  //       else if (i === bubbleCount + 1) outPath = `${prefix}_Image.png`

  //       zip.file(outPath, blob)

  //       if (i === layerCount - 1 && j === fc - 1) {
  //         if (code) {
  //           // Include project config if layer export
  //           const project = getProject()
  //           const blob = new Blob([JSON.stringify(project)], {
  //             type: 'text/plain',
  //           })
  //           zip.file(`${prefix}_Config.txt`, blob)
  //         }

  //         const zipData = await zip.generateAsync({
  //           type: 'blob',
  //           streamFiles: true,
  //         })

  //         downloadFile(
  //           zipData,
  //           `${outFilePrefix}_${new Date().toISOString()}.zip`
  //         )
  //       }
  //     }
  //   }
  // }

  const downloadFile = (data: Blob, filename: string) => {
    // setValue('app.modal', { ...modalExport, status: 'Downloading files' })
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // const cancel = async () => {
  //   if (!useStore.getState().export.exporting) return null

  //   // Run cleanup function
  //   await cleanup()

  //   // No exit functionality with @ffmpeg/ffmpeg so terminating and reloading
  //   await ff.current.terminate()
  //   ff.current = null
  //   ff.current = new FFmpeg()
  //   setValue('export.ffmpegLoaded', false)

  //   // Re-load ffmpeg
  //   await load()
  // }

  // TODO: check recursively (right now only checks one level deep for layer directories)
  const deleteFiles = async () => {
    // Delete ffmpeg files and directory
    const ffmpeg = ff.current;
    const result = await ffmpeg.listDir(ffDir);
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if ([".", ".."].includes(item.name)) continue;
      if (!item.isDir) {
        console.log(`FFMPEG: Deleting file: ${ffDir}/${item.name}`);
        await ffmpeg.deleteFile(`${ffDir}/${item.name}`);
      } else {
        const dirList = await ffmpeg.listDir(`${ffDir}/${item.name}`);
        for (let j = 0; j < dirList.length; j++) {
          const layerItem = dirList[j];
          if ([".", ".."].includes(layerItem.name)) continue;
          if (!layerItem.isDir) {
            console.log(
              `FFMPEG: Deleting file: ${ffDir}/${item.name}/${layerItem.name}`
            );
            await ffmpeg.deleteFile(`${ffDir}/${item.name}/${layerItem.name}`);
          }
        }
        console.log(`FFMPEG: Deleting directory: ${ffDir}/${item.name}`);
        await ffmpeg.deleteDir(`${ffDir}/${item.name}`);
      }
    }
    console.log(`FFMPEG: Deleting directory: ${ffDir}`);
    await ffmpeg.deleteDir(ffDir);
  };

  const cleanup = async () => {
    // render.current.reset = true
    // render.current.frameCount = 0
    await deleteFiles();

    // Remove listeners
    ff.current.off("log", log);

    // setValue('app.modal', null)
    // setValue('export.exporting', false)

    // Reset canvas size (note this needs to be done after exporting value has been set to false)
    // scaleCanvas()

    document.body.classList.remove("exporting");
  };

  // https://ffmpegwasm.netlify.app/docs/getting-started/usage/#transcoding-video
  // used this version after vite demo didn't work - caused hang on chrome - maybe due to multithread - this version doesn't include worker url in load
  const load = useCallback(async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm";
    const ffmpeg = ff.current;

    try {
      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.
      await ffmpeg.load({
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
      // setValue('export.ffmpegLoaded', true)
      setFfmpegLoaded(true);
      // setExportSettings({ ...exportSettings, ffmpegLoaded: true });
      // setValue('export.cancelled', false)
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    load();
    const ffmpeg = ff.current;

    return () => {
      if (ffmpeg) {
        ffmpeg.terminate();
        document.body.classList.remove("ffmpeg-loaded");
      }
    };
  }, [load]);

  useEffect(() => {
    if (ffmpegLoaded) {
      console.log("Loaded FFPMEG");
      document.body.classList.add("ffmpeg-loaded");
    } else {
      document.body.classList.remove("ffmpeg-loaded");
    }
  }, [ffmpegLoaded]);

  return {
    ffmpegLoaded,
    download,
    // cancel,
  };
};

export default useExport;
