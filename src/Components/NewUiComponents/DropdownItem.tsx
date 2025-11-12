import { MouseEventHandler } from "react";

interface IProps {
  value: string;
  onClick: MouseEventHandler<HTMLLIElement>;
}

export const DropdownItem = ({ value, onClick }: IProps) => {
  return (
    <li className="px-3 py-2 hover:bg-[#17191f] cursor-pointer" onClick={onClick}>
      {value}
    </li>
  );
};
