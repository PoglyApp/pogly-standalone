import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface IProps {
  icon?: any;
  style?: any;
}

export const Dropdown = (props: IProps) => {
  const [selectedLayout, setSelectedLayout] = useState("default");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center justify-between  hover:bg-gray-800 rounded-md px-3 py-1.5"
          style={{ backgroundColor: "#10121a", color: "#edf1ff", ...props.style }}
        >
          <span className="flex items-center gap-2">
            {props.icon && <div className="w-4 h-4  rounded flex items-center justify-center">{props.icon}</div>}
            <span className="text-sm">{selectedLayout}</span>
          </span>
          <ChevronDown className="w-4 h-4 " style={{ color: "#52555e" }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-800  mt-1 rounded-lg">
        <DropdownMenuItem
          onClick={() => setSelectedLayout("default")}
          className="px-4 py-2 text-gray-200 hover:bg-gray-700"
        >
          Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
