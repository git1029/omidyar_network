import { useEffect, useState } from "react";
import { SRGBColorSpace, VideoTexture } from "three";
import useStore from "../store/store";

export const constraints = {
  video: { width: 910, height: 512, facingMode: "user" },
};

const useCamera = () => {
  const [texture, setTexture] = useState<VideoTexture | null>(null);

  const [, setInitialized] = useState(false);

  const inputMode = useStore((state) => state.inputMode);
  const patternRef = useStore((state) => state.patternRef);
  const backgroundRef = useStore((state) => state.backgroundRef);
  const cameraRef = useStore((state) => state.cameraRef);
  // const canvasRef = useStore((state) => state.canvasRef);
  const setValue = useStore((state) => state.setValue);

  const [stream, setStream] = useState<MediaStream | null>(null);

  const initializeVideo = () => {
    console.log("Initializing camera/webcam");
    // const video = cameraRef;

    // console.log(video);
    setValue("cameraStatus", 1);

    if (!cameraRef) return;

    let tex = null;
    // console.log(texture);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((mediaStream) => {
          // apply the stream to the video element used in the texture
          cameraRef.srcObject = mediaStream;
          cameraRef.play();
          setInitialized(true);
          tex = new VideoTexture(cameraRef);
          tex.colorSpace = SRGBColorSpace;
          console.log(tex);
          setTexture(tex);
          setStream(mediaStream);
          setValue("cameraStatus", 2);
          if (patternRef) {
            patternRef.uniforms.uCamera.value = tex;
            patternRef.uniforms.uInputAspect.value.z =
              constraints.video.width / constraints.video.height;
          }
          if (backgroundRef) {
            backgroundRef.uniforms.uCamera.value = tex;
            backgroundRef.uniforms.uInputAspect.value.z =
              constraints.video.width / constraints.video.height;
          }
        })
        .catch((error) => {
          console.error("Unable to access the camera/webcam.", error);
          setValue("cameraStatus", 0);
        });
    } else {
      console.error("MediaDevices interface not available.");

      setValue("cameraStatus", 0);
    }
  };

  // function stopStreamedVideo() {
  //   if (!cameraRef) return

  //   const stream = cameraRef.srcObject;

  //   if (stream) {

  //     const tracks = stream.getTracks();

  //     tracks.forEach((track) => {
  //       track.stop();
  //     });

  //     cameraRef.srcObject = null;
  //   }
  // }

  // const stopVideo = () => {
  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
  //       const stream = mediaStream;
  //       const tracks = stream.getTracks();

  //       console.log(tracks);

  //       // tracks[0].stop();
  //       // stream.removeTrack(tracks[0]);

  //       // console.log(stream.getT)

  //       // if (cameraRef) {
  //       //   cameraRef.pause();
  //       //   cameraRef.src = "";
  //       // }

  //       tracks.forEach((t) => t.stop());

  //       if (cameraRef) {
  //         cameraRef.srcObject = null;
  //       }
  //     });
  //   }
  // };

  // const removeVideo = () => {
  //   if (!texture) return;

  //   texture.dispose();
  //   setTexture(null);
  //   setInitialized(false);
  // };

  useEffect(() => {
    if (inputMode.value === 2) {
      if (!texture) {
        initializeVideo();
      }
    } else {
      // stopVideo();
      if (stream) {
        console.log("cancelling");
        const tracks = stream.getTracks();
        tracks.forEach((t) => t.stop());
        if (cameraRef) {
          cameraRef.srcObject = null;
        }
        setTexture(null);
        if (patternRef) {
          patternRef.uniforms.uCamera.value = null;
          patternRef.uniforms.uInputAspect.value.z = 1;
        }
        setValue("cameraStatus", 0);
      }
    }
  }, [inputMode, texture]);

  return null;
};

export default useCamera;
