import useStore from "../../store/store";
// import { useEffect, useRef } from "react";

// const ControlInputText = ({ inverted }: { inverted: boolean }) => {
const ControlInputText = () => {
  // const textPreview = useRef<HTMLImageElement>(null);

  const inputMode = useStore((state) => state.inputMode);
  // const setTextRef = useStore((state) => state.setTextRef);
  const textInput = useStore((state) => state.textInput);
  const setValue = useStore((state) => state.setValue);

  // useEffect(() => {
  //   if (textPreview.current) {
  //     setTextRef(textPreview.current);
  //   }
  // }, [textPreview, setTextRef]);

  // if (inputMode.value !== 3) return;

  return (
    <div
      className={`border border-contrast/50 border w-[300px] rounded-md p-2 flex ${
        inputMode.value === 3 ? "flex" : "hidden"
      }`}
    >
      <textarea
        rows={4}
        placeholder="Enter text here..."
        value={textInput}
        onChange={(e) => setValue("textInput", e.target.value)}
        // className={`min-h-[100px] ${
        //   inverted ? "text-black-100" : "bg-[#222222] text-white"
        // }`}
        className={`min-h-[100px]`}
      />
      {/* <img className=" w-[100px] h-[100px]" src="" ref={textPreview} /> */}
    </div>
  );
};

export default ControlInputText;
