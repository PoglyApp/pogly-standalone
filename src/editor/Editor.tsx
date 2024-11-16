import { Button } from "@/components/inputs/Button";
import { FooterLinks } from "../components/editor/FooterLinks";
import { Logo } from "../components/editor/Logo";
import { Layers } from "@/components/editor/layers/Layers";
import { Layouts } from "@/components/editor/Layouts";
import { Details } from "@/components/editor/Details";
import { Settings } from "lucide-react";
import { SelectionButtons } from "@/components/editor/element_picker/SelectionButtons";
import { Outlet } from "react-router-dom";

export const Editor: React.FC = () => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  if (isOverlay) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }

  return (
    <>
      <div className="absolute editor" style={{ width: "100vw", height: "100vh", zIndex: "2" }}>
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
            <Button
              icon={<Settings size={45} />}
              className="mr-4"
              border={true}
              tooltip="Settings"
              onclick={() => {}}
            />
          </div>
        </div>
      </div>

      <main className="relative" style={{ zIndex: "1" }}>
        <Outlet />
      </main>
    </>
  );
};
