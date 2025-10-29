import { Button } from "@/Components/Inputs/Button";
import { Download, Trash2Icon, Upload } from "lucide-react";

export const DataManagementSettings = () => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-[#aeb4d4] mb-1">data backup</p>
        <div className="flex gap-3 max-md:grid">
          <Button className="flex gap-2 max-md:w-fit" onClick={() => {}}>
            <Download className="self-center" size={18} /> import data
          </Button>
          <Button className="flex gap-2 max-md:w-fit" onClick={() => {}}>
            <Upload className="self-center" size={18} /> export data
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm text-[#aeb4d4] mb-1">delete data</p>
        <div className="flex gap-3 max-md:grid">
          <Button className="flex gap-2 max-md:w-fit" onClick={() => {}}>
            <Trash2Icon className="self-center" size={18} /> delete all Elements
          </Button>
          <Button className="flex gap-2 max-md:w-fit" onClick={() => {}}>
            <Trash2Icon className="self-center" size={18} /> delete all ElementData
          </Button>
        </div>
      </div>
    </div>
  );
};
