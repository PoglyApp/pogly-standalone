import { Checkbox } from "@/Components/Inputs/Checkbox";
import { Select } from "@/Components/Inputs/Select";
import { useState } from "react";

export const StreamPreviewSettings = () => {
  const [streamInteractable, setStreamInteractable] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="stream player interactable" checked={streamInteractable} onChange={setStreamInteractable} />

      <div>
        <p className="text-sm text-[#aeb4d4]">stream quality</p>
        <Select onChange={() => {}} className="w-[210px]">
          <option value="1080p60">1080p60 (source)</option>
          <option value="720p60">720p60</option>
          <option value="360p">360p</option>
          <option value="160p">160p</option>
        </Select>
      </div>
    </div>
  );
};
