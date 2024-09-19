interface ToggleOption {
  label: string;
  icon?: string;
}

interface ToggleOptionProps {
  option: ToggleOption;
  onChange: (label: string) => void;
  isSelected: (label: string) => boolean;
  iconOnly: boolean;
}

interface ToggleProps {
  options: ToggleOption[];
  label?: string;
  onChange: (label: string) => void;
  isSelected: (label: string) => boolean;
  iconOnly?: boolean;
}

const ToggleOption = ({
  option,
  onChange,
  isSelected,
  iconOnly,
}: ToggleOptionProps) => {
  const handleClick = () => onChange(option.label);
  const selected = isSelected(option.label);

  return (
    <div
      className={`w-8 h-8 flex w-fit min-w-10 border rounded-md cursor-pointer items-center justify-center ${
        selected ? "border-foreground/100" : "border-foreground/50"
      } ${
        option.icon !== undefined && iconOnly
          ? ""
          : option.icon !== undefined
          ? "pr-2"
          : "px-2"
      }`}
      onClick={handleClick}
    >
      {option.icon !== undefined && <img className="w-7" src={option.icon} />}
      {(option.icon === undefined || !iconOnly) && (
        <span className="uppercase">{option.label}</span>
      )}
    </div>
  );
};

const Toggle = ({
  options,
  label,
  onChange,
  isSelected,
  iconOnly = false,
}: ToggleProps) => {
  return (
    <div className="flex flex-col w-full gap-y-1">
      {label !== undefined && <label>{label}</label>}
      <div className="flex gap-x-1">
        {options.map((option) => (
          <ToggleOption
            key={option.label}
            option={option}
            onChange={onChange}
            isSelected={isSelected}
            iconOnly={iconOnly}
          />
        ))}
      </div>
    </div>
  );
};

export default Toggle;
