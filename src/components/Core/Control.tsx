import { ReactNode } from "react";

interface ControlProps {
  label?: string;
  children: ReactNode;
}

const Control = ({ label, children }: ControlProps) => {
  return (
    <div className="flex flex-col gap-y-1">
      {label !== undefined && <label>{label}</label>}
      {children}
    </div>
  );
};

export default Control;
