import { ChangeEvent, useRef, useState } from "react";
import useStore from "../../store/store";
import useUpload from "../../helpers/useUpload";
import { TextureLoader, VideoTexture } from "three";

import DefaultImage from "/img.jpg";
import DefaultVideo from "/footage.mp4";
import { Upload } from "../../types";

const defaultUpload = {
  image: {
    name: "img.jpg",
    url: DefaultImage,
    type: "image/jpg",
  },
  video: {
    name: "footage.mp4",
    url: DefaultVideo,
    type: "video/mp4",
  },
};

const ControlInputMedia = ({ inverted }: { inverted: boolean }) => {
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [initial, setInitial] = useState({ image: true, video: true });

  const [imageUpload, setImageUpload] = useState<Upload | null>(
    defaultUpload.image
  );
  const [videoUpload, setVideoUpload] = useState<Upload | null>(
    defaultUpload.video
  );

  const inputMode = useStore((state) => state.inputMode);
  const patternRef = useStore((state) => state.patternRef);
  const setValue = useStore((state) => state.setValue);

  const { loadFile } = useUpload();

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
      setImageUpload(upload);

      setInitial({ ...initial, image: false });

      new TextureLoader().load(dataUrl, (texture) => {
        console.log(texture);
        texture.generateMipmaps = false; // fixes fragment color lookup artifacts around grid cell edges
        texture.needsUpdate = true;

        if (patternRef) {
          // console.log(width, height);
          patternRef.uniforms.uImage.value = texture;
          const { width, height } = texture.image;
          if (width > 0 && height > 0)
            patternRef.uniforms.uInputAspect.value.x = width / height;
        }
      });
    } else if (inputMode.value === 1) {
      setVideoUpload(upload);

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

          // Video width/height available once metadata has loaded
          (texture.image as HTMLVideoElement).addEventListener(
            "loadedmetadata",
            () => {
              const { videoWidth, videoHeight, duration } = texture.image;

              if (videoWidth > 0 && videoHeight > 0) {
                patternRef.uniforms.uInputAspect.value.y =
                  videoWidth / videoHeight;
              } else {
                console.warn(
                  "Unable to access video width and height or have zero value"
                );
              }

              if (!isNaN(duration) && duration > 0) {
                setValue("videoDuration", duration);
              } else {
                console.warn(
                  "Unable to access video duration or has zero value"
                );
              }
            }
          );
        }
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
      setImageUpload(null);

      if (patternRef && patternRef.uniforms.uImage.value) {
        patternRef.uniforms.uImage.value = null;
        patternRef.uniforms.uInputAspect.value.x = 1;
      }
    } else if (inputMode.value === 1 && videoUpload) {
      setVideoUpload(null);
      if (videoRef.current) {
        videoRef.current.src = "";
      }
      if (patternRef && patternRef.uniforms.uVideo.value) {
        patternRef.uniforms.uVideo.value.dispose();
        patternRef.uniforms.uVideo.value = null;
        patternRef.uniforms.uInputAspect.value.y = 1;
      }
    }

    if (fileUploadInputRef.current) {
      fileUploadInputRef.current.value = "";
    }

    if (patternRef) {
      if (inputMode.value === 0) patternRef.uniforms.uImage.value = null;
      else if (inputMode.value === 1) patternRef.uniforms.uVideo.value = null;
    }
    // setInitial(false);
  };

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <div
          className={`border border-foreground/50 border flex flex-col gap-y-2 h-fit w-[300px] text-sm rounded-md p-2 ${
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
            <div className="h-[100px] max-h-[100px] w-[100px] border border-foreground/50 rounded-sm">
              <div
                className={`w-full h-full bg-contain bg-no-repeat bg-center ${
                  inverted ? "filter invert" : ""
                } ${inputMode.value === 0 ? "flex" : "hidden"}`}
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
                  className={`max-h-[100px] ${
                    inverted ? "filter invert" : ""
                  } object-contain`}
                  ref={videoRef}
                >
                  {initial.video && videoUpload && (
                    <source src={videoUpload.url} type={videoUpload.type} />
                  )}
                </video>
              </div>
            </div>
            {currentUpload && inputMode.value < 2 && (
              <div className="flex flex-col gap-y-1 grow">
                <div className="line-clamp-3 break-all uppercase">
                  {currentUpload.name}
                </div>
              </div>
            )}
          </div>

          <div className={currentUpload ? "hidden" : "none"}>
            Click here to upload {inputMode.value === 0 ? "an" : "a"}{" "}
            {inputMode.label.toLowerCase()}
          </div>
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
