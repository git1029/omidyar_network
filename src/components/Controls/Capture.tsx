import { useMemo } from "react";
import useStore from "../../store/store";
import { CanvasTexture } from "three";
import { inputModes } from "../../store/options";
import { constraints } from "../../helpers/useCamera";
import { Upload } from "../../types";

const Capture = () => {
  const patternRef = useStore((state) => state.patternRef);
  const backgroundRef = useStore((state) => state.backgroundRef);
  const cameraRef = useStore((state) => state.cameraRef);
  const effectRef = useStore((state) => state.effectRef);
  const cameraStatus = useStore((state) => state.cameraStatus);
  const inputMode = useStore((state) => state.inputMode);
  const setValue = useStore((state) => state.setValue);

  const [offscreen, ctx] = useMemo(() => {
    const offscreen = new OffscreenCanvas(
      constraints.video.width,
      constraints.video.height
    );
    const ctx = offscreen.getContext("2d");
    return [offscreen, ctx];
  }, []);

  const captureImage = async () => {
    if (cameraRef && backgroundRef && patternRef && ctx) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(cameraRef, -offscreen.width, 0);
      ctx.restore();

      if (patternRef.uniforms.uImage.value) {
        patternRef.uniforms.uImage.value.dispose();
      }
      if (backgroundRef.uniforms.uImage.value) {
        backgroundRef.uniforms.uImage.value.dispose();
      }

      const texture = new CanvasTexture(offscreen);
      texture.generateMipmaps = false;
      texture.needsUpdate = true;

      patternRef.uniforms.uImage.value = texture;
      backgroundRef.uniforms.uImage.value = texture;

      const { width, height } = offscreen;
      const aspect = width > 0 && height > 0 ? width / height : 1;
      if (patternRef) {
        patternRef.uniforms.uInputAspect.value.x = aspect;
      }
      if (backgroundRef) {
        backgroundRef.uniforms.uInputAspect.value.x = aspect;
      }
      if (effectRef) {
        effectRef.uniforms.uInputAspect.value.x = aspect;
      }
      const blob = await offscreen.convertToBlob({ type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const filetype = "image/jpeg";
      const filename = `Camera_Capture_${new Date().toISOString()}.jpg`;

      const upload: Upload = {
        name: filename,
        url,
        type: filetype,
        width: offscreen.width,
        height: offscreen.height,
      };
      setValue("imageUpload", upload);
      setValue("inputMode", inputModes[0]);
    }
  };

  if (!(inputMode.value === 2 && cameraStatus === 2)) return null;

  return (
    <div className="flex gap-x-1">
      <button onClick={captureImage}>Capture Image</button>
    </div>
  );
};

export default Capture;
