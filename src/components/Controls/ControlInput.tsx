import { useRef, useState } from "react";
import ControlGroup from "./ControlGroup";
import { TextureLoader } from "three";
import { inputModes } from "../../store/options";

interface Upload {
  name: string;
  url: string;
  type: string;
}

const ControlInput = () => {
  const [inputMode, setInputMode] = useState(inputModes[0]);

  const handleInputModeChange = (mode: number) => {
    const match = inputModes.find((m) => m.value === mode);
    setInputMode(match !== undefined ? match : inputModes[0]);
  };

  const fileUploadInput = useRef<HTMLInputElement>(null);

  const [imageUpload, setImageUpload] = useState<Upload | null>(null);
  const [videoUpload, setVideoUpload] = useState<Upload | null>(null);

  const currentUpload =
    inputMode.value === 0
      ? imageUpload
      : inputMode.value === 1
      ? videoUpload
      : null;

  const handleFileUploadClick = () => {
    if (fileUploadInput.current && !currentUpload) {
      fileUploadInput.current.click();
    }
  };

  const handleFileUploadKeydown = (code: string) => {
    if (fileUploadInput.current && !currentUpload && code === "Enter") {
      fileUploadInput.current.click();
    }
  };

  const handleMediaClear = () => {
    if (inputMode.value === 0 && imageUpload) setImageUpload(null);
    else if (inputMode.value === 1 && videoUpload) setVideoUpload(null);
    if (fileUploadInput.current) {
      fileUploadInput.current.value = "";
    }
  };

  const handleFileUpload = (event: Event) => {
    if (inputMode.value > 1) return;
    const file = (event.target as HTMLInputElement).files[0];
    if (file) loadFile(file);
  };

  const loadFile = (file: File | null = null) => {
    if (!file || !inputMode.file || !inputMode.accepts) return;

    const filename = file.name;
    const extension = filename.split(".").pop();
    const accepts = inputMode.accepts.map((type) => type.split("/")[1]);

    if (extension !== undefined && accepts.includes(extension.toLowerCase())) {
      const reader = new FileReader();
      reader.onloadend = () => handleMediaUpload(file, reader.result);
      reader.readAsDataURL(file);
    } else {
      console.warn(`Invalid file format, only ${accepts.join(", ")} accepted.`);
    }
  };

  const handleMediaUpload = (
    file: File,
    loadedFile: string | ArrayBuffer | null
  ) => {
    if (!file || typeof loadedFile !== "string") return;

    console.log(file, loadFile, file.name);

    new TextureLoader().load(loadedFile, (tex) => {
      console.log(tex);
    });

    const media = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      // tex: new TextureLoader().load(loadedFile),
    };

    if (inputMode.value === 0) setImageUpload(media);
    else if (inputMode.value === 1) setVideoUpload(media);

    // let loader = null
    // if (inputMode.value === 0) loader = TextureLoader
    // else if (inputMode.value === 1) loader = VideoTexture

    // if (loader === null) return

    // new loader().load(loadedFile, (tex) => {
    //   tex.colorSpace = SRGBColorSpace;

    //   const { width, height } = tex.source.data;

    //   tex.generateMipmaps = false;
    //   tex.magFilter = LinearFilter;
    //   tex.minFilter = LinearFilter;
    //   tex.needsUpdate = true;

    //   const image = {
    //     name: file.name,
    //     texture: tex,
    //     url: URL.createObjectURL(file),
    //     width,
    //     height,
    //     aspectRatio: width / height,
    //   };

    //   console.log(image);
    // });
  };

  return (
    <>
      <ControlGroup title="Input">
        <select
          value={inputMode.value}
          onChange={(e) => handleInputModeChange(Number(e.target.value))}
        >
          {inputModes.map((mode) => (
            <option key={mode.label} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>

        {inputMode.value < 2 && (
          <div
            className={`border-dashed border-black-100 border h-fit w-[300px] flex text-sm rounded-sm p-2 ${
              currentUpload ? "" : "cursor-pointer"
            }`}
            tabIndex={0}
            onClick={handleFileUploadClick}
            onKeyDown={(e) => handleFileUploadKeydown(e.code)}
          >
            {currentUpload !== null && (
              <div className="flex gap-x-2">
                <div>
                  {inputMode.value === 0 && (
                    <div
                      className="h-[100px] max-h-[100px] w-[100px] bg-contain bg-no-repeat bg-center"
                      style={{
                        backgroundImage: `url(${imageUpload?.url})`,
                        backgroundColor: "rgba(0, 0, 0, .05)",
                      }}
                    ></div>
                  )}
                  {inputMode.value === 1 && (
                    <div
                      className="flex w-[100px] h-[100px] items-center justify-center"
                      style={{ backgroundColor: "rgba(0, 0, 0, .05)" }}
                    >
                      <video
                        width="100"
                        height="100"
                        autoPlay={true}
                        muted={true}
                        loop={true}
                        className="max-h-[100px]"
                      >
                        <source
                          src={videoUpload?.url}
                          type={videoUpload?.type}
                        />
                      </video>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-y-2 grow">
                  <div className="line-clamp-3 break-all">
                    {currentUpload.name}
                  </div>
                  <div
                    className="bg-white p-1 rounded-sm border-black-100 border flex w-fit cursor-pointer text-sm mt-auto"
                    onClick={handleMediaClear}
                  >
                    Clear
                  </div>
                </div>
              </div>
            )}
            {currentUpload === null && (
              <div>
                Click here to upload {inputMode.value === 0 ? "an" : "a"}{" "}
                {inputMode.label.toLowerCase()}
              </div>
            )}
          </div>
        )}

        {inputMode.file && inputMode.accepts && (
          <input
            ref={fileUploadInput}
            type="file"
            accept={inputMode.accepts.join(", ")}
            onChange={handleFileUpload}
            className={`pointer-events-none`}
            hidden
          />
        )}

        {inputMode.value === 3 && (
          <textarea
            rows={4}
            className="w-[300px] border border-black-100 p-2 min-h-[65px]"
            placeholder="Enter text here..."
          ></textarea>
        )}
      </ControlGroup>
    </>
  );
};

export default ControlInput;
