import { PropsWithChildren } from "react";

interface IProps {
  setQuickswapVisible: Function;
  className?: string;
}

export const Dropdown = ({ setQuickswapVisible, className, children }: PropsWithChildren<IProps>) => {
  return (
    <div
      className={`absolute z-10 mt-2bg-[#10121a] border border-gray-700 rounded-md shadow-lg w-32 ` + className}
      onMouseLeave={() => setQuickswapVisible(false)}
    >
      <ul className="text-gray-300 text-xs">{children}</ul>
    </div>
  );
};
