import { Button } from "@/components/inputs/Button";
import { FooterLinks } from "../components/editor/FooterLinks";
import { Logo } from "../components/editor/Logo";
import { Layers } from "@/components/editor/layers/Layers";
import { Layouts } from "@/components/editor/Layouts";
import { Details } from "@/components/editor/Details";
import { Settings } from "lucide-react";
import { SelectionButtons } from "@/components/editor/element_picker/SelectionButtons";

export const Editor: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div>
        <Logo />
      </div>

      <div>
        <div className="flex">
          <Layouts />
          <Details />
        </div>

        <Layers />
      </div>

      <div className="absolute flex justify-between" style={{ bottom: "0", width: "100%" }}>
        <FooterLinks />

        <SelectionButtons />

        <div className="self-center mt-2">
          <Button icon={<Settings size={45} />} className="mr-4" border={true} tooltip="Settings" onclick={() => {}} />
        </div>
      </div>
    </div>
  );
};
