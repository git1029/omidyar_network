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
  // const imageUpload = useStore((state) => state.imageUpload);
  const cameraStatus = useStore((state) => state.cameraStatus);
  const inputMode = useStore((state) => state.inputMode);
  // const canvasRef = useStore(state => state.canvasRef)
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
      // console.log(cameraRef);
      // offscreen.width = constraints.video.width;
      // offscreen.width = constraints.video.height
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
      // Flip horizontally to match camera input
      // texture.wrapS = RepeatWrapping;
      // texture.repeat.x = -1;
      // texture.center.set(0.5, 0.5);
      // texture.repeat.set(-1, 1);
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

      // await new Promise((resolve) => setTimeout(resolve, 100));
      // const blob: Blob = await new Promise((resolve) =>
      //   canvasRef.toBlob((blob) => {
      //     console.log(blob);
      //     // if (blob) {
      //     //   const url = URL.createObjectURL(blob);
      //     //   console.log(url);
      //     // }
      //     if (blob) return resolve(blob);
      //     throw new Error("Error converting canvas to blob");
      //   })
      // );
      const blob = await offscreen.convertToBlob({ type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const filetype = "image/jpeg";
      const filename = `Camera_Capture_${new Date().toISOString()}.jpg`;

      // const image = new Image();
      // const texture = new Texture();
      // image.src = url;
      const upload: Upload = {
        name: filename,
        url,
        type: filetype,
        width: offscreen.width,
        height: offscreen.height,
      };
      setValue("imageUpload", upload);
      setValue("inputMode", inputModes[0]);
      // image.onload = () => {
      //   // console.log(e)
      //   console.log(image);
      //   // document.body.style.background = `url(image)`;
      //   texture.image = image;
      //   texture.needsUpdate = true;
      //   patternRef.uniforms.uImage.value = texture;
      //   backgroundRef.uniforms.uImage.value = texture;
      //   effectRef.uniforms.uCapture.value = 0;
      //   backgroundRef.uniforms.uCapture.value = 0;
      //   setValue("inputMode", inputModes[0]); // switch to image mode
      //   setValue("imageUpload", upload);
      // };
      // }

      // const filetype = "image/jpeg";
      // const filename = `Camera_Capture_${new Date().toISOString()}.jpg`;

      // setValue("inputMode", inputModes[0]);
      // setValue("imageUpload", {
      //   name: filename,
      //     url: texture.image.src,
      //   type: filetype
      // } )

      //   await new Promise((resolve) => setTimeout(resolve, 100));
      //   const blob: Blob = await new Promise((resolve) =>
      //     canvasRef.toBlob((blob) => {
      //       console.log(blob);
      //       // if (blob) {
      //       //   const url = URL.createObjectURL(blob);
      //       //   console.log(url);
      //       // }
      //       if (blob) return resolve(blob);
      //       throw new Error("Error converting canvas to blob");
      //     })
      //   );
      //   const filetype = "image/jpeg";
      //   const filename = `Camera_Capture_${new Date().toISOString()}.jpg`;
      //   const url = URL.createObjectURL(blob.slice(0, blob.size, filetype));
      //   const image = new Image();
      //   const texture = new Texture();
      //   image.src = url;
      //   const upload = {
      //     name: filename,
      //     url,
      //     type: filetype,
      //   };
      //   image.onload = () => {
      //     // console.log(e)
      //     console.log(image);
      //     // document.body.style.background = `url(image)`;
      //     texture.image = image;
      //     texture.needsUpdate = true;
      //     patternRef.uniforms.uImage.value = texture;
      //     backgroundRef.uniforms.uImage.value = texture;
      //     effectRef.uniforms.uCapture.value = 0;
      //     backgroundRef.uniforms.uCapture.value = 0;
      //     setValue("inputMode", inputModes[0]); // switch to image mode
      //     setValue("imageUpload", upload);
      //   };
      // }
    }
  };

  if (!(inputMode.value === 2 && cameraStatus === 2)) return null;

  return (
    <div className="flex gap-x-1">
      <button onClick={captureImage}>Capture Image</button>
      {/* <button>Capture Video</button> */}
    </div>
  );
};

export default Capture;
