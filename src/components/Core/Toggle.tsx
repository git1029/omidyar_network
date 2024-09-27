import { ReactNode } from "react";

interface ToggleOption {
  label: string;
  icon?: string;
}

interface ToggleOptionProps<T> {
  option: T;
  value: T;
  onChange: <T>(value: T) => void;
  iconOnly?: boolean;
  customIcon: string | null | ReactNode;
}

interface ToggleProps<T> {
  label?: string;
  value: T;
  options: T[];
  onChange: <T>(value: T) => void;
  iconOnly?: boolean;
  customIcons?: string[] | ReactNode[];
}

const ToggleOption = <T extends ToggleOption>({
  option,
  value,
  onChange,
  iconOnly,
  customIcon,
}: ToggleOptionProps<T>) => {
  const handleClick = () => {
    onChange(option);
  };

  const selected = value === option;

  const hasIcon = !(option.icon === undefined && customIcon === null);

  const optionIcon = () => {
    if (customIcon) {
      if (typeof customIcon === "string") return <img src={customIcon} />;
      return customIcon;
    }

    if (option.icon !== undefined && typeof option.icon === "string")
      return <img src={option.icon} />;

    return null;
  };

  return (
    <div
      className={`w-8 h-8 flex w-fit min-w-10 border rounded-md cursor-pointer items-center justify-center ${
        selected
          ? "border-foreground/100 bg-foreground/5"
          : "border-foreground/50"
      } ${hasIcon && iconOnly ? "" : hasIcon ? "pr-2" : "px-2"}`}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.code === "Enter") handleClick();
      }}
    >
      {hasIcon && (
        <div className="h-8 w-8 flex items-center justify-center">
          {optionIcon()}
        </div>
      )}
      {!(hasIcon && iconOnly) && (
        <span className="uppercase">{option.label}</span>
      )}
    </div>
  );
};

const Toggle = <T extends ToggleOption>({
  label,
  value,
  options,
  onChange,
  iconOnly,
  customIcons,
}: ToggleProps<T>) => {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-col w-full gap-y-1">
      {label !== undefined && <label>{label}</label>}
      <div className="flex gap-x-1">
        {options.map((option, i) => {
          let icon = null;
          if (customIcons !== undefined && customIcons[i] !== undefined) {
            icon = customIcons[i];
          }

          return (
            <ToggleOption
              key={option.label}
              option={option}
              value={value}
              onChange={onChange}
              iconOnly={iconOnly}
              customIcon={icon}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Toggle;
