import { useEffect } from "react";
import { clamp } from "three/src/math/MathUtils.js";
import useStore from "../store/store";
import { Layout } from "../types";

export const scaleCanvas = (
  layout: Layout,
  exporting = false,
  exportFormat = "image"
) => {
  const br = 1;
  const padX = window.innerWidth < 1024 ? 16 : 32;
  const padY = window.innerWidth < 1024 ? 16 : 32;
  const panelWidth =
    window.innerWidth < 1024 ? 0 : window.innerWidth < 1536 ? 430 : 630;

  const limit = {
    min: 320,
    max: 1000,
  };

  const canvasRef = useStore.getState().canvasRef;
  const canvasContainerRef = useStore.getState().canvasContainerRef;
  const fullscreen = useStore.getState().fullscreen;

  if (fullscreen) return;

  let availableWidth =
    clamp(window.innerWidth, 320, 2560) - panelWidth - padX * 2 - br * 2;
  let availableHeight =
    clamp(window.innerHeight, 600, 2560) - padY * 2 - br * 2;

  availableWidth = clamp(availableWidth, limit.min, limit.max);
  availableHeight = clamp(availableHeight, limit.min, limit.max);

  let { width, height } = layout.size;

  if (exporting) {
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

      // Halve video export (4k -> 1080p)
      if (layout.label !== "Custom") {
        width /= 2;
        height /= 2;
      }
    }
  }

  const scaleX = availableWidth < width ? availableWidth / width : 1;
  const scaleY =
    availableHeight < height * scaleX ? availableHeight / (height * scaleX) : 1;

  const scale = clamp(scaleX * scaleY, 0, 1);

  if (canvasContainerRef) {
    if (exporting) {
      canvasContainerRef.style.width = `${width}px`;
      canvasContainerRef.style.height = `${height}px`;
    } else {
      canvasContainerRef.style.width = `${width * scale}px`;
      canvasContainerRef.style.height = `${height * scale}px`;
    }
  }

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
    }
  }
};

export const scaleCanvasScreen = () => {
  const canvasContainerRef = useStore.getState().canvasContainerRef;

  console.log(screen);

  const width = screen.width;
  const height = screen.height;

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
    const handleResize = () => {
      const { exporting } = useStore.getState().exportSettings;

      if (!canvasContainerRef || !canvasRef || exporting) return;

      scaleCanvas(layout);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [canvasRef, canvasContainerRef, layout]);
};

export default useResize;
