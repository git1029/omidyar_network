import useStore from "../../store/store";

const ControlInputText = () => {
  const inputMode = useStore((state) => state.inputMode);
  const textInput = useStore((state) => state.textInput);
  const setValue = useStore((state) => state.setValue);

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
        className={`min-h-[100px]`}
      />
    </div>
  );
};

export default ControlInputText;
