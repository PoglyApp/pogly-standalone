import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "../NewUiComponents/Button";
import { Checkbox } from "../NewUiComponents/Checkbox";

export const GeneralSettings = () => {
  const [urlDefaultOption, setUrlDefaultOption] = useState<boolean>(false);
  const [compressUploadedImages, setCompressUploadedImages] = useState<boolean>(false);
  const [compressCopiedImages, setCompressCopiedImages] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => {}}>copy overlay url</Button>
      <div className="flex gap-3 max-md:grid">
        <Button className="flex-1" onClick={() => {}}>
          clear quick-swap modules
        </Button>
        <Button className="flex-1" onClick={() => {}}>
          clear connection settings
        </Button>
      </div>

      <div>
        <p className="text-sm text-[#aeb4d4] mb-1">overlay refresh</p>
        <div className="flex gap-3 max-md:grid">
          <Button className="flex flex-1 gap-2" onClick={() => {}}>
            <RefreshCcw className="self-center" size={18} /> force refresh overlay
          </Button>
          <Button className="flex flex-1 gap-2" onClick={() => {}}>
            <RefreshCcw className="self-center" size={18} /> force hard refresh overlay
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm text-[#aeb4d4] mb-1">upload options</p>
        <div className="flex flex-col gap-2">
          <Checkbox label="set url as default upload type" checked={urlDefaultOption} onChange={setUrlDefaultOption} />
          <Checkbox
            label="compress uploaded images"
            checked={compressUploadedImages}
            onChange={setCompressUploadedImages}
          />
          <Checkbox label="compress copied images" checked={compressCopiedImages} onChange={setCompressCopiedImages} />
        </div>
      </div>
    </div>
  );
};
