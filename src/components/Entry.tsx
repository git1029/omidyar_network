import { useRef, useState } from "react";
import useStore from "../store/store";
import Logo from "./Logo";

const storage = window.localStorage.getItem("omidyar-settings");

const Entry = () => {
  const fade = useRef<HTMLDivElement | null>(null);

  const [preLaunched] = useState(storage && JSON.parse(storage).launched);
  const [launched, setLaunched] = useState(false);
  const loaded = useStore((state) => state.loaded);

  const handleLaunch = () => {
    // Update storage
    const storage = window.localStorage.getItem("omidyar-settings");
    let settings = { launched: true };
    if (storage) {
      settings = { ...JSON.parse(storage), launched: true };
    }
    window.localStorage.setItem("omidyar-settings", JSON.stringify(settings));

    setLaunched(true);
  };

  if (preLaunched) return null;

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-background z-[100] transition-opacity duration-500 delay-0 ease-in-out flex flex-col gap-y-2 items-center justify-between p-10 ${
        launched ? "opacity-0" : "opacity-1"
      }`}
      ref={fade}
      onTransitionEnd={() => {
        if (fade.current) fade.current.style.display = "none";
      }}
    >
      <h1>Omidyar Network</h1>
      <div className="flex flex-col items-center justify-between h-2/3">
        <p className="font-serif text-[6vw] leading-[1.1] text-center">
          Share your humanity,
          <br />
          shape your digital pattern.
        </p>
        <p
          className={`uppercase text-2xl cursor-pointer transition-opacity duration-500 delay-0 ease-in-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleLaunch}
          onTransitionEnd={(e) => e.stopPropagation()}
        >
          Start
        </p>
        <Logo />
      </div>
    </div>
  );
};

export default Entry;
