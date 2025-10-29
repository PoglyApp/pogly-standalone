import { Check } from "lucide-react";
import { useId } from "react";

interface IProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = ({ label, checked, onChange, disabled, className = "" }: IProps) => {
  const id = useId();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={id}
        className={`inline-flex items-center gap-2 select-none ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />

        <span
          aria-hidden
          className="
            grid place-items-center h-5 w-5 rounded-md
            bg-[#111318] border border-[#2a2d33] shadow-sm
            transition
            peer-checked:border-blue-500 peer-checked:bg-blue-500/10
            peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40
          "
        >
          {checked && <Check size={14} />}
        </span>

        <span className="text-sm text-gray-200">{label}</span>
      </label>
    </div>
  );
};
