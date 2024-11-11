import { Button } from "@/components/inputs/Button";
import { FooterLinks } from "../components/editor/FooterLinks";
import { Logo } from "../components/editor/Logo";
import { Layers } from "@/components/editor/layers/Layers";
import { Layouts } from "@/components/editor/Layouts";
import { Details } from "@/components/editor/Details";
import { Settings, Image, Code, Type } from "lucide-react";

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

        <div
          className="flex p-4 pb-3 mb-10 rounded-xl"
          style={{ color: "#5c5f6a", backgroundColor: "#1e212b", height: "100%" }}
        >
          <Button icon={<Image size={45} />} className="mr-3" />
          <Button icon={<Code size={45} />} className="mr-3" />
          <Button icon={<Type size={45} />} />
        </div>

        <Button icon={<Settings size={45} />} className=" mr-4 mb-3 self-end" />
      </div>
    </div>
  );
};
