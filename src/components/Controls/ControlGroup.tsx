import { ReactNode } from "react";

const ControlGroup = ({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) => {
  return (
    <div className="border-black border-t flex flex-col gap-y-2 pt-2">
      {title !== undefined && <h2>{title}</h2>}
      {children}
    </div>
  );
};

export default ControlGroup;
