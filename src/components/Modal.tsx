import useStore from "../store/store";

const Modal = () => {
  const modal = useStore((state) => state.modal);
  const backgroundColor = useStore((state) => state.backgroundColor);
  const setValue = useStore((state) => state.setValue);

  if (!modal) return null;

  const handleClose = () => {
    if (modal.closeOnClick) modal.closeOnClick();
    setValue("modal", null);
  };

  return (
    <div className="absolute top-0 left-0 right-0 h-full flex justify-center items-center z-20 bg-background/75">
      <div className="w-[400px] h-fit p-4 rounded-md bg-background border border-contrast/50 shadow-md shadow-black-100/10">
        <div className="flex flex-col gap-y-4 h-full">
          <h3 className="text-2xl font-serif">{modal.title}</h3>
          <div className="flex flex-col gap-y-4">
            <div>{modal.description}</div>
            <div className="flex flex-col gap-y-2">
              {modal.progress !== undefined && (
                <div className="h-3 border w-full border-contrast rounded-md relative overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 bottom-0 ${
                      backgroundColor.label === "Transparent"
                        ? "bg-contrast"
                        : "bg-foreground"
                    }`}
                    style={{
                      width: `${modal.progress * 100}%`,
                    }}
                  ></div>
                </div>
              )}
              {modal.status !== undefined && (
                <div className="text-sm">{modal.status}</div>
              )}
            </div>
          </div>
          <div className="flex mt-auto border-t border-contrast pt-4 mt-2">
            <button onClick={handleClose}>{modal.closeLabel || "Close"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
