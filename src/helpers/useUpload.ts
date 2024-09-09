import { ChangeEvent } from "react";
import useStore from "../store/store";
// import { TextureLoader } from "three";

const useUpload = () => {
  const inputMode = useStore((state) => state.inputMode);

  const loadFile = (
    event: ChangeEvent<HTMLInputElement>,
    handleUpload?: (file: File, dataUrl: string) => void
  ) => {
    if (
      inputMode.value > 1 ||
      !inputMode.file ||
      !inputMode.accepts ||
      !event.target.files
    )
      return;

    const file = event.target.files[0];
    if (!file) return;

    const filename = file.name;
    const extension = filename.split(".").pop();
    const accepts = inputMode.accepts.map((type) => type.split("/")[1]);

    if (extension !== undefined && accepts.includes(extension.toLowerCase())) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(file, reader.result);
        if (typeof reader.result === "string" && handleUpload !== undefined) {
          handleUpload(file, reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      console.warn(`Invalid file format, only ${accepts.join(", ")} accepted.`);
    }
  };

  // const handleMediaUpload = (
  //   file: File,
  //   loadedFile: string | ArrayBuffer | null
  // ) => {
  //   if (!file || typeof loadedFile !== "string") return;

  //   new TextureLoader().load(loadedFile, (tex) => {
  //     console.log(tex);
  //   });

  //   const media = {
  //     name: file.name,
  //     url: URL.createObjectURL(file),
  //     type: file.type,
  //     // tex: new TextureLoader().load(loadedFile),
  //   };

  //   console.log(media);

  //   // if (inputMode.value === 0) setImageUpload(media);
  //   // else if (inputMode.value === 1) setVideoUpload(media);
  // };

  return {
    loadFile,
  };
};

export default useUpload;
