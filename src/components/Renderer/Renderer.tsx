import { MutableRefObject } from "react";
import useExport from "../../helpers/useExport";
import { ExportObject } from "../Scene";

const Renderer = ({
  ffmpeg,
}: {
  ffmpeg: MutableRefObject<ExportObject | null>;
}) => {
  ffmpeg.current = useExport();
  // console.log(ffmpeg.current.ffmpegLoaded);

  return null;
};

export default Renderer;
