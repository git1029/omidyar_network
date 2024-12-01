import { ChangeEvent, useEffect, useRef, useState } from "react";
import useStore from "../../store/store";
import useUpload from "../../helpers/useUpload";
import { TextureLoader, VideoTexture } from "three";

// VideoTexture.prototype.update = function () {
//   const video = this.image;
//   const paused = video.paused;

//   // Don't transfer textures from paused videos.
//   if (paused) return;

//   if (video.readyState >= video.HAVE_CURRENT_DATA) {
//     // if (paused) {
//     //   this.wasPaused = true;
//     // } else if (this.wasPaused) {
//     //   this.wasPaused = false;
//     // }

//     this.needsUpdate = true;
//   }
// };

// console.log(VideoTexture);

// import { Upload } from "../../types";
// import { defaultUpload } from "../../store/options";

// const ControlInputMedia = ({ inverted }: { inverted: boolean }) => {
const ControlInputMedia = () => {
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [initial, setInitial] = useState({ image: true, video: true });
  // const [videoPaused, setVideoPaused] = useState(false);

  // const [imageUpload, setImageUpload] = useState<Upload | null>(
  //   defaultUpload.image
  // );
  // const [videoUpload, setVideoUpload] = useState<Upload | null>(
  //   defaultUpload.video
  // );

  const videoPaused = useStore((state) => state.videoPaused);
  const inputMode = useStore((state) => state.inputMode);
  const imageUpload = useStore((state) => state.imageUpload);
  const videoUpload = useStore((state) => state.videoUpload);
  const videoDuration = useStore((state) => state.videoDuration);
  const patternRef = useStore((state) => state.patternRef);
  const backgroundRef = useStore((state) => state.backgroundRef);
  const effectRef = useStore((state) => state.effectRef);
  const setValue = useStore((state) => state.setValue);

  const { loadFile } = useUpload();

  useEffect(() => {
    if (videoRef.current) {
      setValue("videoRef", videoRef.current);
    }
  }, [videoRef, setValue]);

  useEffect(() => {
    if (videoRef.current) {
      // console.log(videoRef.current.currentTime);
      // videoRef.current.pause();
      // videoRef.current.currentTime += 0.1;
      if (videoPaused) videoRef.current.pause();
      else videoRef.current.play();
    }
  }, [videoPaused, videoRef]);

  const handleVideoPlayback = () => {
    setValue("videoPaused", !videoPaused);
  };

  const uploadFile = (file: File, dataUrl: string) => {
    if (inputMode.value > 1) return;

    if (!file || !dataUrl) return;

    // Dispose existing upload
    handleMediaClear();

    const upload = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    };

    if (inputMode.value === 0) {
      setValue("imageUpload", upload);

      setInitial({ ...initial, image: false });

      new TextureLoader().load(dataUrl, (texture) => {
        console.log(texture);
        texture.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
        texture.needsUpdate = true;

        const { width, height } = texture.image;
        const aspect = width > 0 && height > 0 ? width / height : 1;

        if (patternRef) {
          // console.log(width, height);
          patternRef.uniforms.uImage.value = texture;
          patternRef.uniforms.uInputAspect.value.x = aspect;
        }

        if (backgroundRef) {
          // console.log(width, height);
          backgroundRef.uniforms.uImage.value = texture;
          backgroundRef.uniforms.uInputAspect.value.x = aspect;
        }
        if (effectRef) {
          // console.log(width, height);
          effectRef.uniforms.uImage.value = texture;
          effectRef.uniforms.uInputAspect.value.x = aspect;
        }
      });
    } else if (inputMode.value === 1) {
      setValue("videoUpload", upload);
      // console.log(upload);

      if (videoRef.current) {
        const texture = new VideoTexture(videoRef.current);
        videoRef.current.src = upload.url;
        videoRef.current.play();
        console.log(texture);
        texture.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
        // texture.needsUpdate = true;
        texture.update();

        setInitial({ ...initial, video: false });

        if (patternRef) {
          if (patternRef.uniforms.uVideo.value) {
            patternRef.uniforms.uVideo.value.dispose();
          }
          patternRef.uniforms.uVideo.value = texture;
        }

        if (backgroundRef) {
          if (backgroundRef.uniforms.uVideo.value) {
            backgroundRef.uniforms.uVideo.value.dispose();
          }
          backgroundRef.uniforms.uVideo.value = texture;
        }

        if (effectRef) {
          if (effectRef.uniforms.uVideo.value) {
            effectRef.uniforms.uVideo.value.dispose();
          }
          effectRef.uniforms.uVideo.value = texture;
        }

        // Video width/height available once metadata has loaded
        (texture.image as HTMLVideoElement).addEventListener(
          "loadedmetadata",
          () => {
            const { videoWidth, videoHeight, duration } = texture.image;

            if (videoWidth > 0 && videoHeight > 0) {
              const aspect = videoWidth / videoHeight;
              if (patternRef) patternRef.uniforms.uInputAspect.value.y = aspect;
              if (backgroundRef)
                backgroundRef.uniforms.uInputAspect.value.y = aspect;
              if (effectRef) effectRef.uniforms.uInputAspect.value.y = aspect;
            } else {
              console.warn(
                "Unable to access video width and height or have zero value"
              );
            }

            if (!isNaN(duration) && duration > 0) {
              console.log(duration);
              setValue("videoDuration", duration);
            } else {
              console.warn("Unable to access video duration or has zero value");
              setValue("videoDuration", null);
            }
          }
        );
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.value);
    loadFile(e, uploadFile);
  };

  const currentUpload =
    inputMode.value === 0
      ? imageUpload
      : inputMode.value === 1
      ? videoUpload
      : null;

  const handleFileUploadClick = () => {
    // if (fileUploadInputRef.current && !currentUpload) {
    if (fileUploadInputRef.current) {
      fileUploadInputRef.current.click();
    }
  };

  // const handleFileUploadKeydown = (code: string) => {
  //   // if (fileUploadInputRef.current && !currentUpload && code === "Enter") {
  //   if (fileUploadInputRef.current && code === "Enter") {
  //     fileUploadInputRef.current.click();
  //   }
  // };

  const handleMediaClear = () => {
    if (inputMode.value === 0 && imageUpload) {
      setValue("imageUpload", null);

      if (patternRef && patternRef.uniforms.uImage.value) {
        patternRef.uniforms.uImage.value = null;
        patternRef.uniforms.uInputAspect.value.x = 1;
      }
      if (backgroundRef && backgroundRef.uniforms.uImage.value) {
        backgroundRef.uniforms.uImage.value = null;
        backgroundRef.uniforms.uInputAspect.value.x = 1;
      }
      if (effectRef && effectRef.uniforms.uImage.value) {
        effectRef.uniforms.uImage.value = null;
        effectRef.uniforms.uInputAspect.value.x = 1;
      }
    } else if (inputMode.value === 1 && videoUpload) {
      setValue("videoUpload", null);
      if (videoRef.current) {
        videoRef.current.src = "";
      }
      if (patternRef && patternRef.uniforms.uVideo.value) {
        patternRef.uniforms.uVideo.value.dispose();
        patternRef.uniforms.uVideo.value = null;
        patternRef.uniforms.uInputAspect.value.y = 1;
      }
      if (backgroundRef && backgroundRef.uniforms.uVideo.value) {
        backgroundRef.uniforms.uVideo.value.dispose();
        backgroundRef.uniforms.uVideo.value = null;
        backgroundRef.uniforms.uInputAspect.value.y = 1;
      }
      if (effectRef && effectRef.uniforms.uVideo.value) {
        effectRef.uniforms.uVideo.value.dispose();
        effectRef.uniforms.uVideo.value = null;
        effectRef.uniforms.uInputAspect.value.y = 1;
      }
    }

    if (fileUploadInputRef.current) {
      fileUploadInputRef.current.value = "";
    }

    if (patternRef) {
      if (inputMode.value === 0) patternRef.uniforms.uImage.value = null;
      else if (inputMode.value === 1) patternRef.uniforms.uVideo.value = null;
    }

    if (backgroundRef) {
      if (inputMode.value === 0) backgroundRef.uniforms.uImage.value = null;
      else if (inputMode.value === 1)
        backgroundRef.uniforms.uVideo.value = null;
    }

    if (effectRef) {
      if (inputMode.value === 0) effectRef.uniforms.uImage.value = null;
      else if (inputMode.value === 1) effectRef.uniforms.uVideo.value = null;
    }
    // setInitial(false);
  };

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <div
          className={`border border-contrast/50 border flex flex-col gap-y-2 h-fit w-[300px] text-sm rounded-md p-2 ${
            currentUpload ? "" : "cursor-pointer"
          } ${inputMode.value < 2 ? "flex" : "hidden"}`}
          // tabIndex={0}
          // onClick={handleFileUploadClick}
          // onKeyDown={(e) => handleFileUploadKeydown(e.code)}
        >
          <div
            className={`gap-x-2 items-start ${
              currentUpload ? "flex" : "hidden"
            }`}
          >
            <div className="h-[100px] max-h-[100px] w-1/2 border border-contrast/50 rounded-sm">
              <div
                // className={`w-full h-full bg-contain bg-no-repeat bg-center ${
                //   inverted ? "filter invert" : ""
                // } ${inputMode.value === 0 ? "flex" : "hidden"}`}
                className={`w-full h-full bg-contain bg-no-repeat bg-center ${
                  inputMode.value === 0 ? "flex" : "hidden"
                }`}
                style={
                  {
                    // backgroundImage: imageUpload
                    //   ? `url(${imageUpload.url})`
                    //   : "none",
                    // backgroundColor: "rgba(0, 0, 0, .05)",
                  }
                }
              >
                <img
                  src={imageUpload?.url}
                  className="object-contain mx-auto"
                />
              </div>
              <div
                className="items-center justify-center w-full h-full"
                style={{
                  backgroundColor: "rgba(0, 0, 0, .05)",
                  display: inputMode.value === 1 ? "flex" : "none",
                }}
              >
                <video
                  width="100"
                  height="100"
                  autoPlay={true}
                  muted={true}
                  loop={true}
                  playsInline={true}
                  // onSeeked={}
                  // className={`max-h-[100px] ${
                  //   inverted ? "filter invert" : ""
                  // } object-contain`}
                  className={`max-h-[100px] object-contain`}
                  ref={videoRef}
                >
                  {initial.video && videoUpload && (
                    <source src={videoUpload.url} type={videoUpload.type} />
                  )}
                </video>
              </div>
            </div>
            <div className="flex grow flex-col w-1/2 justify-between h-full">
              {currentUpload && inputMode.value < 2 && (
                <div className="flex flex-col">
                  <div className="line-clamp-2 break-all uppercase">
                    {currentUpload.name}
                  </div>
                  {inputMode.value === 1 && videoDuration !== null && (
                    <div className="normal-case">
                      <span className="uppercase">Duration:</span>{" "}
                      {videoDuration.toFixed(1)}s
                    </div>
                  )}
                </div>
              )}

              {currentUpload && inputMode.value === 1 && videoRef.current && (
                <div>
                  <button onClick={handleVideoPlayback}>
                    {videoPaused ? "Play" : "Pause"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* <div className={currentUpload ? "hidden" : "none"}>
            Click here to upload {inputMode.value === 0 ? "an" : "a"}{" "}
            {inputMode.label.toLowerCase()}
          </div> */}
        </div>

        {currentUpload && inputMode.value < 2 && (
          <button onClick={handleFileUploadClick}>
            Replace {inputMode.label}
          </button>
        )}
      </div>

      <input
        ref={fileUploadInputRef}
        type="file"
        accept={inputMode.accepts ? inputMode.accepts.join(", ") : ""}
        onChange={handleFileUpload}
        className={`pointer-events-none`}
        hidden
      />
    </>
  );
};

export default ControlInputMedia;
