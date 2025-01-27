import { useContext, useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { StyledButton } from "../StyledComponents/StyledButton";
import { ModalContext } from "../../Contexts/ModalContext";
import { styled } from "styled-components";
import Elements from "../../module_bindings/elements";
import ImageElement from "../../module_bindings/image_element";
import ElementData from "../../module_bindings/element_data";
import ImageElementData from "../../module_bindings/image_element_data";
import { updateElementStruct } from "../../StDB/Reducers/Update/updateElementStruct";
import ElementStruct from "../../module_bindings/element_struct";

interface IProps {
  selectedElement: Elements;
}

export const UpdateElementSourceModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [element, setElement] = useState<Elements>();
  const [source, setSource] = useState<string>("");

  useEffect(() => {
    if (!props.selectedElement) return;
    if (props.selectedElement.element.tag !== "ImageElement") return;

    const oldElement: Elements = Elements.findById(props.selectedElement.id)!;
    setElement(oldElement);

    const imageElement = oldElement.element.value as ImageElement;

    if (imageElement.imageElementData.tag === "ElementDataId") {
      setSource(ElementData.findById(imageElement.imageElementData.value)!.data);
    } else {
      setSource(imageElement.imageElementData.value);
    }
  }, [props.selectedElement]);

  const handleSave = () => {
    const newImageElementData: ImageElementData = { tag: "RawData", value: source };
    const imageElement = element!.element.value as ImageElement;

    const newImageElement = ElementStruct.ImageElement({
      imageElementData: newImageElementData as ImageElementData,
      width: imageElement.width,
      height: imageElement.height,
    });

    updateElementStruct(props.selectedElement.id, newImageElement);

    handleOnClose();
  };

  const handleOnClose = () => {
    closeModal("textCreation_modal", modals, setModals);
  };

  if (isOverlay) return <></>;

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        Update image source
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
        <StyledTextarea
          rows={4}
          cols={50}
          disabled={false}
          defaultValue={source}
          placeholder="Image source here"
          onChange={(event: any) => {
            setSource(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#0a2a47", textAlign: "center", display: "block" }}>
        <StyledButton
          disabled={false}
          label="Cancel"
          textColor="black"
          backgroundColor="#ffffffa6"
          hoverColor="white"
          onClick={handleOnClose}
        />

        <StyledButton
          disabled={false}
          label="Save"
          textColor="black"
          backgroundColor="#ffffffa6"
          hoverColor="white"
          onClick={handleSave}
        />
      </DialogActions>
    </Dialog>
  );
};

const StyledTextarea = styled.textarea`
  background-color: #0a2a47;
  color: #ffffffa6;
  border-color: #ffffffa6;
  padding: 8px;

  &::placeholder {
    color: #ffffff81;
  }
`;
