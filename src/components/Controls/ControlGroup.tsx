import { ReactNode } from "react";

const ControlGroup = ({
  title,
  border = true,
  className = "",
  children,
}: {
  title?: string;
  border?: boolean;
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={`flex flex-col gap-y-2 pt-4 ${
        border ? "border-black border-t" : ""
      } ${className}`}
    >
      {title !== undefined && <h2>{title}</h2>}
      {children}
    </div>
  );
};

export default ControlGroup;
