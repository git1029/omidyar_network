import { ChangeEvent } from "react";
import useStore from "../store/store";

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

  return {
    loadFile,
  };
};

export default useUpload;
