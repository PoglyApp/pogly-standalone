import { Accordion, AccordionDetails, AccordionSummary, Button, Skeleton, Tooltip } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ImageIcon from "@mui/icons-material/Image";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ElementData from "../../../module_bindings/element_data";
import { insertElement } from "../../../StDB/Reducers/Insert/insertElement";
import ElementStruct from "../../../module_bindings/element_struct";
import InfoOutlineIcon from "@mui/icons-material/InfoOutlined";
import ImageElementData from "../../../module_bindings/image_element_data";
import styled from "styled-components";
import { ImageUploadModal } from "../../Modals/ImageUploadModal";
import { useContext, useState } from "react";
import { StyledInput } from "../../StyledComponents/StyledInput";
import { HandleElementSelectionContextMenu } from "../../../Utility/HandleContextMenu";
import { ModalContext } from "../../../Contexts/ModalContext";
import PermissionLevel from "../../../module_bindings/permission_level";
import { LayoutContext } from "../../../Contexts/LayoutContext";

interface IProps {
  elementData: ElementData[];
  strictSettings: { StrictMode: boolean; Permission?: PermissionLevel };
  contextMenu: any;
  setContextMenu: Function;
}

export const ImageCategory = (props: IProps) => {
  const { setModals } = useContext(ModalContext);
  const layoutContext = useContext(LayoutContext);

  const [searchimage, setSearchImage] = useState<string>("");

  const showImageUploadModal = () => {
    setModals((oldModals: any) => [...oldModals, <ImageUploadModal key="imageUpload_modal" />]);
  };

  const AddElementToCanvas = (elementData: ElementData) => {
    insertElement(
      ElementStruct.ImageElement({
        imageElementData: ImageElementData.ElementDataId(elementData.id),
        width: elementData.dataWidth,
        height: elementData.dataHeight,
      }),
      layoutContext.activeLayout
    );
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{
          color: "#ffffffa6",
        }}
      >
        <ImageIcon sx={{ marginRight: "5px" }} />
        <span style={{ lineHeight: 1.5, fontSize: "15px" }}>Images</span>
        {props.strictSettings.StrictMode &&
        props.strictSettings.Permission?.tag !== "Owner" &&
        props.strictSettings.Permission?.tag !== "Moderator" ? (
          <Tooltip title="Strict mode is enabled and preventing you from uploading a new Image. Ask the instance owner!">
            <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingLeft: "5px" }} />
          </Tooltip>
        ) : (
          <></>
        )}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: "#000c17",
          paddingBottom: "5px",
        }}
      >
        {!props.strictSettings.StrictMode ||
        props.strictSettings.Permission?.tag === "Owner" ||
        props.strictSettings.Permission?.tag === "Moderator" ? (
          <Button
            variant="text"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              color: "#ffffffa6",
              textTransform: "initial",
              justifyContent: "left",
              width: "100%",
            }}
            onClick={showImageUploadModal}
          >
            Add Image
          </Button>
        ) : (
          <></>
        )}

        <StyledInput focused={false} label="Search" color="#ffffffa6" onChange={setSearchImage} defaultValue={""} />

        {props.elementData.map((elementData: ElementData) => {
          if (elementData.dataType.tag === "ImageElement")
            if (searchimage === "" || elementData.name.toLocaleLowerCase().includes(searchimage.toLowerCase())) {
              return (
                <div
                  key={elementData.id}
                  onContextMenu={(event: any) => {
                    HandleElementSelectionContextMenu(event, props.setContextMenu, props.contextMenu, elementData);
                  }}
                >
                  <Button
                    variant="text"
                    sx={{
                      color: "#ffffffa6",
                      textTransform: "initial",
                      justifyContent: "left",
                      width: "100%",
                    }}
                    onClick={() => AddElementToCanvas(elementData)}
                  >
                    <ElementIcon src={elementData.data} />
                    {elementData.name}
                  </Button>
                  <br />
                </div>
              );
            }

          return null;
        })}

        <Skeleton
          id="imageSkeleton"
          variant="rounded"
          width={186}
          height={44}
          sx={{ bgcolor: "#393434", display: "none" }}
        />
      </AccordionDetails>
    </Accordion>
  );
};

const ElementIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
`;
