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
      style={{ height: "fit-content", width: "fit-content", bottom: "0", right: "50%" }}
    >
      <div
        className="flex p-4 pb-3 mb-10 rounded-xl"
        style={{ color: "#5c5f6a", backgroundColor: "#1e212b", height: "100%" }}
      >
        <Button
          icon={<Image size={45} />}
          className="mr-3"
          border={true}
          tooltip="Add image"
          onclick={() => setShowSelectionMenu(!showSelectionMenu)}
        />
        <Button
          icon={<Code size={45} />}
          className="mr-3"
          border={true}
          tooltip="Add widget"
          onclick={() => setShowSelectionMenu(!showSelectionMenu)}
        />
        <Button
          icon={<Type size={45} />}
          border={true}
          tooltip="Add text"
          onclick={() => setShowSelectionMenu(!showSelectionMenu)}
        />
      </div>

      {showSelectionMenu && (
        <Container className="absolute" style={{ top: "-520px", height: "500px", width: "500px" }}>
          <div className="flex">
            <Button
              text="GIFs"
              className="mr-3"
              fontSize="16px"
              fontColor="#edf1ff"
              border={true}
              tooltip="Tenor GIFs"
              onclick={() => {}}
            />
            <Button
              text="Widgets"
              className="mr-3"
              fontSize="16px"
              fontColor="#edf1ff"
              border={true}
              tooltip="Widgets"
              onclick={() => {}}
            />
            <Button
              text="Images"
              className="mr-3"
              fontSize="16px"
              fontColor="#edf1ff"
              border={true}
              tooltip="Images"
              onclick={() => {}}
            />
            <Button
              text="Emotes"
              className="mr-3"
              fontSize="18px"
              fontColor="#edf1ff"
              border={true}
              tooltip="Channel emotes"
              onclick={() => {}}
            />
          </div>

          <TextInput placeholder="Search..." style={{ width: "100%" }} />
        </Container>
      )}
    </div>
  );
};
