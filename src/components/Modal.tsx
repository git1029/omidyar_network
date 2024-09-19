import useStore from "../store/store";

const Modal = () => {
  const modal = useStore((state) => state.modal);

  if (!modal) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-full flex justify-center items-center z-20">
      <div className="w-[400px] h-fit p-4 rounded-md bg-background border border-foreground shadow-md shadow-black-100/10">
        <div className="flex flex-col gap-y-4 h-full">
          <h3 className="text-xl font-serif">Exporting</h3>
          <div className="flex flex-col gap-y-4">
            <div className="text-sm">
              Please don't change, reload, or close this browser tab while
              export is in progress
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="h-3 border w-full border-foreground rounded-md relative">
                <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-white"></div>
              </div>
              <div className="text-sm">Saving frame: 1/60</div>
            </div>
          </div>
          <div className="flex mt-auto border-t border-foreground pt-4 mt-2">
            <button>Cancel Export</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
