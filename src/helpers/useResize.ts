import { useEffect } from "react";
import { clamp } from "three/src/math/MathUtils.js";
import useStore from "../store/store";
import { Layout } from "../types";

// // Calculates width, height, and scale values for canvas based on available space in window with control panel
// export const getScale = (width: number, height: number) => {
//   const { exporting } = useStore.getState().exportSettings;

//   const padX = 32 * 2;
//   const padY = 32 * 2;
//   const controlsWidth = 630;
//   const limit = {
//     min: 320,
//     max: 1000,
//   };

//   const availableWidth =
//     Math.max(1200, Math.min(2560, window.innerWidth)) - controlsWidth - padX;
//   const availableHeight =
//     Math.max(320, Math.min(1440, window.innerHeight)) - padY;

//   let w = width;
//   let h = height;

//   // only clamp width/height when not exporting else halved values for 2pr might not be correct
//   if (!exporting) {
//     w = clamp(width, limit.min, limit.max);
//     h = clamp(height, limit.min, limit.max);
//   }

//   const scaleX = availableWidth < w ? availableWidth / w : 1;
//   const scaleY =
//     availableHeight < h * scaleX ? availableHeight / (h * scaleX) : 1;

//   const scale = clamp(scaleX * scaleY, 0, 1);

//   if (exporting) return { width: w, height: h, scale };
//   return { width: w * scale, height: h * scale, scale };
// };

// // Scale canvas container
// export const scaleCanvas = () => {
//   const { size } = useStore.getState().layout;
//   const { exporting, format } = useStore.getState().exportSettings;
//   const canvas = useStore.getState().canvasRef;
//   const canvasContainer = useStore.getState().canvasContainerRef;

//   if (!canvasContainer || !canvas) return;

//   // Get export resolution
//   // const res = levaStore.get('Export.resolution')

//   // Get aspect ratio
//   // const aspect =
//   //   aspectRatio !== undefined
//   //     ? aspectRatio
//   //     : levaStore.get('General.aspectRatio')
//   // const aspect = levaStore.get('General.aspectRatio')

//   // Get width/height from leva
//   // let width, height
//   // if (label === 'Custom') {
//   //   const custom = levaStore.get('General.size')
//   //   // console.log('scaleCanvas', 'custom aspect', custom, updateLeva)
//   //   width = custom.W
//   //   height = custom.H
//   // } else {
//   //   width = config.size.sizes[aspect].W
//   //   height = config.size.sizes[aspect].H
//   // }
//   let { width, height } = size;

//   if (exporting) {
//     // // If 4K export double the width/height (unless in custom mode)
//     // if (label !== 'Custom' && res === '4K') {
//     //   width *= 2
//     //   height *= 2
//     // }

//     // Half export size if pixel ratio is 2 to standardize output resolution
//     if (window.devicePixelRatio === 2) {
//       width /= 2;
//       height /= 2;
//     }

//     // Get even sizes if exporting video/mp4 (h264 must have width/height divisible by 2)
//     if (format.typeRoot === "video") {
//       if (width % 2 === 1) {
//         width = width + 1;
//       }
//       if (height % 2 === 1) {
//         height = height + 1;
//       }
//     }
//   }

//   const scale = getScale(width, height);
//   canvasContainer.style.width = `${scale.width}px`;
//   canvasContainer.style.height = `${scale.height}px`;

//   // if (updateLeva) {
//   //   // Update canvasSize value (used to get aspect ratio for text container max width)
//   //   levaStore.setValueAtPath(
//   //     'General.canvasSize',
//   //     JSON.stringify({ W: size.width, H: size.height })
//   //   )
//   // }

//   // Get canvas
//   // const canvas =
//   // cnv !== undefined ? cnv : document.querySelector('#canvas canvas')

//   if (canvas) {
//     if (exporting) {
//       // For export use full width and height scale canvas with transform
//       canvas.style.width = `${scale.width}px`;
//       canvas.style.height = `${scale.height}px`;
//       canvas.style.transform = `scale(${scale.scale}, ${scale.scale})`;
//     } else {
//       // Remove any transform from canvas (width and height taken from canvas container)
//       canvas.style.removeProperty("transform");
//     }
//   }
// };

export const scaleCanvas = (
  layout: Layout,
  exporting = false,
  exportFormat = "image"
) => {
  const br = 1;
  const padX = 32;
  const padY = 32;
  const panelWidth = 630;

  // const minWidth = 1280;
  // const minHeight = 600;

  const limit = {
    min: 320,
    max: 1000,
  };

  const canvasRef = useStore.getState().canvasRef;
  const canvasContainerRef = useStore.getState().canvasContainerRef;
  const fullscreen = useStore.getState().fullscreen;

  if (fullscreen) return;

  let availableWidth =
    clamp(window.innerWidth, 1280, 2560) - panelWidth - padX * 2 - br * 2;
  let availableHeight =
    clamp(window.innerHeight, 600, 2560) - padY * 2 - br * 2;

  availableWidth = clamp(availableWidth, limit.min, limit.max);
  availableHeight = clamp(availableHeight, limit.min, limit.max);

  let { width, height } = layout.size;

  // console.log(width, height);

  if (exporting) {
    // // If 4K export double the width/height (unless in custom mode)
    // if (label !== 'Custom' && res === '4K') {
    //   width *= 2
    //   height *= 2
    // }

    // Half export size if pixel ratio is 2 to standardize output resolution
    if (window.devicePixelRatio > 1) {
      width /= window.devicePixelRatio;
      height /= window.devicePixelRatio;
    }

    // Get even sizes if exporting video/mp4 (h264 must have width/height divisible by 2)
    if (exportFormat === "video") {
      if (width % 2 === 1) {
        width = width + 1;
      }
      if (height % 2 === 1) {
        height = height + 1;
      }
    }
  }

  const scaleX = availableWidth < width ? availableWidth / width : 1;
  const scaleY =
    availableHeight < height * scaleX ? availableHeight / (height * scaleX) : 1;

  // console.log(availableWidth, availableHeight);

  // const aspect = layout.aspect;
  // const size = layout.size;

  // // console.log("width 100%, height auto");
  // console.log(
  //   "width 100%",
  //   `[${availableWidth}]`,
  //   `[${availableHeight}]`,
  //   availableWidth,
  //   availableWidth / aspect,
  //   aspect
  // );

  // console.log(1 / aspect);

  // const w = layout.size.width;
  // const h = layout.size.height;

  // // only clamp width/height when not exporting else halved values for 2pr might not be correct
  // if (!exporting) {
  // w = clamp(layout.size.width, limit.min, limit.max);
  // h = clamp(layout.size.height, limit.min, limit.max);
  // }

  // const scaleX = availableWidth < w ? availableWidth / w : 1;
  // const scaleY =
  //   availableHeight < h * scaleX ? availableHeight / (h * scaleX) : 1;

  // console.log(scaleX, scaleY)

  // const scale = clamp(scaleX * scaleY, 0, 1);

  // // if (exporting) return { width: w, height: h, scale };
  // // return { width: w * scale, height: h * scale, scale };

  // // console.log(w * scale, h * scale);

  // // if (w * scale > limit.max)
  // const width = w * scale;
  // const height = h * scale;

  // return availableWidth * aspect > availableHeight;

  // console.log(aspect);

  // console.log(availableWidth / availableHeight, layout.aspect);
  // return availableWidth / availableHeight < layout.aspect;

  const scale = clamp(scaleX * scaleY, 0, 1);

  if (canvasContainerRef) {
    if (exporting) {
      // console.log(
      //   "setting canvascontainer to",
      //   width,
      //   height,
      //   availableWidth,
      //   availableHeight
      // );
      canvasContainerRef.style.width = `${width}px`;
      canvasContainerRef.style.height = `${height}px`;
      // canvasContainerRef.style.transform = `scale(${scale}, ${scale})`;
      // canvasContainerRef.style.aspectRatio = `${layout.aspect}`;
    } else {
      // canvasContainerRef.style.width = `${width}px`;
      // canvasContainerRef.style.height = `${height}px`;
      // console.log(
      //   "setting canvascontainer to VERTICAL",
      //   width,
      //   height,
      //   availableWidth,
      //   availableHeight,
      //   width * scale,
      //   height * scale
      // );
      // const vertical = availableWidth / availableHeight < layout.aspect;
      // canvasContainerRef.style.width = vertical ? "100%" : "auto";
      // canvasContainerRef.style.height = vertical ? "auto" : "100%";
      canvasContainerRef.style.width = `${width * scale}px`;
      canvasContainerRef.style.height = `${height * scale}px`;
      // canvasContainerRef.style.removeProperty("transform");
    }
  }

  // if (canvasContainerRef) {
  //   if (aspect >= 1) {
  //     if (
  //       availableWidth / aspect >= availableHeight &&
  //       availableWidth / aspect < 1000
  //     ) {
  //       canvasContainerRef.style.width = "auto";
  //       canvasContainerRef.style.height = "100%";
  //     } else {
  //       canvasContainerRef.style.width = "100%";
  //       canvasContainerRef.style.height = "auto";
  //     }
  //   } else {
  //     if (
  //       availableWidth * aspect >= availableHeight &&
  //       availableWidth * aspect < 1000
  //     ) {
  //       canvasContainerRef.style.width = "100%";
  //       canvasContainerRef.style.height = "auto";
  //     } else {
  //       canvasContainerRef.style.width = "auto";
  //       canvasContainerRef.style.height = "100%";
  //     }
  //   }
  // }
  // console.log(
  //   "height 100%",
  //   availableWidth / aspect,
  //   availableHeight,
  //   `[${availableWidth}]`,
  //   aspect
  // );

  // if using width then w = 100%, h = w * aspect

  // const scale = clamp(scaleX * scaleY, 0, 1);

  // console.log(scale, exporting, exportFormat);

  if (canvasRef) {
    if (exporting) {
      console.log("Export: setting canvas size to", width, height);
      // For export use full width and height scale canvas with transform
      canvasRef.style.width = `${width}px`;
      canvasRef.style.height = `${height}px`;
      canvasRef.style.transform = `scale(${scale}, ${scale})`;
    } else {
      // Remove any transform from canvas (width and height taken from canvas container)
      canvasRef.style.removeProperty("transform");
      // canvasRef.style.removeProperty("width");
      // canvasRef.style.removeProperty("height");
    }
  }
};

export const scaleCanvasScreen = () => {
  // const canvasRef = useStore.getState().canvasRef;
  const canvasContainerRef = useStore.getState().canvasContainerRef;

  console.log(screen);

  const width = screen.width;
  const height = screen.height;
  // const orientation = screen.orientation.type;

  // if (orientation.includes("landscape")) {
  //   width = screen.height;
  //   height = screen.width;
  // }

  // on ipad screen.width/height seems to be incorrect, window.innerWidth is correct...

  console.log("scaling to", width, height);

  if (canvasContainerRef) {
    canvasContainerRef.style.width = `${width}px`;
    canvasContainerRef.style.height = `${height}px`;
  }
};

const useResize = () => {
  const canvasRef = useStore((state) => state.canvasContainerRef);
  const canvasContainerRef = useStore((state) => state.canvasContainerRef);
  const layout = useStore((state) => state.layout);

  useEffect(() => {
    // console.log("useeffect");
    const handleResize = () => {
      // const canvasRef = useStore.getState().canvasContainerRef
      // const canvasContainerRef = useStore.getState().canvasContainerRef
      const { exporting } = useStore.getState().exportSettings;

      if (!canvasContainerRef || !canvasRef || exporting) return;

      // scaleCanvas({
      //   canvasContainerRef,
      //   gl,
      //   // image,
      //   layout: useStore.getState().layout,
      // })

      scaleCanvas(layout);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [canvasRef, canvasContainerRef, layout]);
};

export default useResize;
