import { ChangeEventHandler } from "react";

interface IProps {
  placeholder: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  value?: string;
  title?: string;
  subTitle?: string;
  titleOnLeft?: boolean;
  password?: boolean;
  disabled?: boolean;
  inputClassName?: string;
}

export const TextInput = ({
  placeholder,
  onChange,
  value,
  title,
  subTitle,
  titleOnLeft,
  password,
  disabled,
  inputClassName,
}: IProps) => {
  return (
    <div className={titleOnLeft ? " flex items-center gap-2" : ""}>
      {title && (
        <p className="text-sm text-[#aeb4d4]">
          {title} {subTitle && <span className="text-xs text-[#aeb4d47a] pl-1 pt-0.5">{subTitle}</span>}
        </p>
      )}
      <input
        type={password ? "password" : "text"}
        placeholder={placeholder}
        value={value ? value : ""}
        className={
          "bg-[#10121a] text-[#e9eeff] p-3 rounded-md placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#2c2f3a] " +
          inputClassName
        }
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};
