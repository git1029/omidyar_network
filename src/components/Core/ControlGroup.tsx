import { ReactNode, useState } from "react";

const ControlGroup = ({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`flex flex-col border border-contrast/50 rounded-lg ${
        visible ? "" : "border-opacity-50"
      } ?${className}`}
    >
      <div
        className="cursor-pointer px-3 py-2"
        onClick={() => setVisible(!visible)}
      >
        <h2>{title}</h2>
      </div>
      <div
        className={`px-3 pb-4 flex-col gap-y-3 ${visible ? "flex" : "hidden"}`}
      >
        {children}
      </div>
    </div>
  );
};

export default ControlGroup;
