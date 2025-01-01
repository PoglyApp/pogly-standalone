import { Button } from "@/components/inputs/Button";
import { FooterLinks } from "../components/editor/FooterLinks";
import { Logo } from "../components/editor/Logo";
import { Layers } from "@/components/editor/layers/Layers";
import { Layouts } from "@/components/editor/Layouts";
import { Details } from "@/components/editor/Details";
import { Settings } from "lucide-react";
import { SelectionButtons } from "@/components/editor/element_picker/SelectionButtons";
import { Outlet } from "react-router-dom";
import styled from "styled-components";

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
      <Container className="absolute disablePointerEvents">
        <Logo />

        <Details />
        <Layouts />
        <Layers />

        <FooterLinks />

        <SelectionButtons />

        <Button
          icon={<Settings className="2xl:w-24 xl:w-18 lg:w-14 md:w-10 sm:w-6 h-auto" />}
          className="mr-4 mb-5 fixed enablePointerEvents"
          style={{ bottom: "0", right: "0" }}
          border={true}
          tooltip="Settings"
          onclick={() => {}}
        />
      </Container>

      <main className="relative" style={{ zIndex: "1" }}>
        <Outlet />
      </main>
    </>
  );
};

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  z-index: 2;
`;
