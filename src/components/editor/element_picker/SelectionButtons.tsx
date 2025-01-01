import { Container } from "@/components/general/Container";
import { Button } from "@/components/inputs/Button";
import { TextInput } from "@/components/inputs/TextInput";
import { Image, Code, Type } from "lucide-react";
import { useState } from "react";

export const SelectionButtons: React.FC = () => {
  const [showSelectionMenu, setShowSelectionMenu] = useState<boolean>(false);

  return (
    <div
      className="block absolute enablePointerEvents"
      style={{ bottom: "0", right: "46vw" }}
    >
      <div
        className="flex pb-3 mb-10 rounded-xl 2xl:p-6  xl:p-5  lg:p-4  md:p-3  sm:p-2"
        style={{ color: "#5c5f6a", backgroundColor: "#1e212b", height: "100%" }}
      >
        <Button
          icon={<Image className="2xl:w-24 xl:w-18 lg:w-14 md:w-10 sm:w-6 h-auto"/>}
          className="mr-3"
          border={true}
          tooltip={showSelectionMenu ? undefined : "Add image"}
          onclick={() => setShowSelectionMenu(!showSelectionMenu)}
        />
        <Button
          icon={<Code className="2xl:w-24 xl:w-18 lg:w-14 md:w-10 sm:w-6 h-auto"/>}
          className="mr-3"
          border={true}
          tooltip={showSelectionMenu ? undefined : "Add widget"}
          onclick={() => setShowSelectionMenu(!showSelectionMenu)}
        />
        <Button
          icon={<Type className="2xl:w-24 xl:w-18 lg:w-14 md:w-10 sm:w-6 h-auto"/>}
          border={true}
          tooltip={showSelectionMenu ? undefined : "Add text"}
          onclick={() => setShowSelectionMenu(!showSelectionMenu)}
        />
      </div>

      {showSelectionMenu && (
        <Container className="absolute 
          2xl:w-[650px] 2xl:h-[650px] 2xl:top-[-655px]
          xl:w-[650px] xl:h-[650px] xl:top-[-655px]
          lg:w-[500px] lg:h-[500px] lg:top-[-505px]
          md:w-[400px] md:h-[400px] md:top-[-405px]
          sm:w-[300px] sm:h-[300px] sm:top-[-305px]
        ">
          <div className="flex">
            <Button
              text="GIFs"
              className="mr-3 lg:text-lg md:text-base sm:text-sm"
              fontColor="#edf1ff"
              border={true}
              tooltip="Tenor GIFs"
              onclick={() => {}}
            />
            <Button
              text="Widgets"
              className="mr-3 lg:text-lg md:text-base sm:text-sm"
              fontColor="#edf1ff"
              border={true}
              tooltip="Widgets"
              onclick={() => {}}
            />
            <Button
              text="Images"
              className="mr-3 lg:text-lg md:text-base sm:text-sm"
              fontColor="#edf1ff"
              border={true}
              tooltip="Images"
              onclick={() => {}}
            />
            <Button
              text="Emotes"
              className="mr-3 lg:text-lg md:text-base sm:text-sm"
              fontColor="#edf1ff"
              border={true}
              tooltip="Channel emotes"
              onclick={() => {}}
            />
          </div>

          <TextInput className="rounded-sm highlight g:text-lg md:text-base sm:text-sm" placeholder="Search..." style={{ width: "100%" }} />
        </Container>
      )}
    </div>
  );
};
