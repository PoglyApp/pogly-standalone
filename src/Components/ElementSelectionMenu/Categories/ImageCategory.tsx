import { Accordion, AccordionDetails, AccordionSummary, Button, Skeleton, Tooltip } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ImageIcon from "@mui/icons-material/Image";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { insertElement } from "../../../StDB/Reducers/Insert/insertElement";
import InfoOutlineIcon from "@mui/icons-material/InfoOutlined";
import styled from "styled-components";
import { ImageUploadModal } from "../../Modals/ImageUploadModal";
import React, { useContext, useMemo, useState, useCallback, useEffect } from "react";
import { StyledInput } from "../../StyledComponents/StyledInput";
import { HandleElementSelectionContextMenu } from "../../../Utility/HandleContextMenu";
import { ModalContext } from "../../../Contexts/ModalContext";
import { LayoutContext } from "../../../Contexts/LayoutContext";
import { DebugLogger } from "../../../Utility/DebugLogger";
import { convertBinaryToDataURI } from "../../../Utility/ImageConversion";
import { ElementData, ElementStruct, ImageElementData, PermissionLevel } from "../../../module_bindings";

interface IProps {
  elementData: ElementData[];
  strictSettings: { StrictMode: boolean; Permission?: PermissionLevel };
  contextMenu: any;
  setContextMenu: Function;
  isSearch: boolean;
  searchTerm?: string;
}

export const ImageCategory = React.memo((props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const layoutContext = useContext(LayoutContext);
  const [searchimage, setSearchImage] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(!props.isSearch);

  const showImageUploadModal = useCallback(() => {
    DebugLogger("Opening image upload modal");
    setModals((oldModals: any) => [...oldModals, <ImageUploadModal key="imageUpload_modal" />]);
  }, [setModals]);

  const AddElementToCanvas = useCallback(
    (elementData: ElementData) => {
      DebugLogger("Adding element to canvas");
      insertElement(
        ElementStruct.ImageElement({
          imageElementData: ImageElementData.ElementDataId(elementData.id),
          width: elementData.dataWidth,
          height: elementData.dataHeight,
        }),
        layoutContext.activeLayout
      );

      if (props.isSearch) {
        closeModal("spotlight_modal", modals, setModals);
      }
    },
    [layoutContext.activeLayout, closeModal, modals, props.isSearch, setModals]
  );

  const filteredElements = useMemo(() => {
    return props.elementData.filter((elementData: ElementData) => {
      return (
        elementData.dataType.tag === "ImageElement" &&
        (searchimage === "" || elementData.name.toLowerCase().includes(searchimage.toLowerCase()))
      );
    });
  }, [props.elementData, searchimage]);

  const renderedElementList = useMemo(() => {
    if (props.isSearch && props.searchTerm === "") return <></>;
    return filteredElements.map((elementData: ElementData) => (
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
          <ElementIcon src={convertBinaryToDataURI(elementData)} />
          {elementData.name}
        </Button>
        <br />
      </div>
    ));
  }, [filteredElements, props.contextMenu, props.setContextMenu, AddElementToCanvas, props.isSearch, props.searchTerm]);

  useEffect(() => {
    if (props.searchTerm === undefined) return;
    setSearchImage(props.searchTerm);
    if (props.searchTerm === "" || props.searchTerm === undefined) {
      setVisible(false);
    } else {
      setVisible(filteredElements.length > 0);
    }
  }, [props.searchTerm, props.elementData, searchimage, filteredElements.length]);

  if (!visible) return <></>;

  return (
    <Accordion defaultExpanded={props.isSearch ? true : false}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{ color: "#ffffffa6", backgroundColor: "#001529" }}
        tabIndex={-1}
      >
        <ImageIcon sx={{ marginRight: "5px" }} />
        <span style={{ lineHeight: 1.5, fontSize: "15px" }}>Images</span>
        {props.strictSettings.StrictMode &&
        props.strictSettings.Permission?.tag !== "Owner" &&
        props.strictSettings.Permission?.tag !== "Moderator" &&
        !props.isSearch ? (
          <Tooltip title="Strict mode is enabled and preventing you from uploading a new Image. Ask the instance owner!">
            <InfoOutlineIcon sx={{ fontSize: 16, color: "orange", alignSelf: "center", paddingLeft: "5px" }} />
          </Tooltip>
        ) : (
          <></>
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: "#000c17", paddingBottom: "5px" }}>
        {(!props.strictSettings.StrictMode ||
          props.strictSettings.Permission?.tag === "Owner" ||
          props.strictSettings.Permission?.tag === "Moderator") &&
          !props.isSearch && (
            <Button
              variant="text"
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                color: "#ffffffa6",
                textTransform: "initial",
                justifyContent: "left",
                width: "100%",
                paddingBottom: "10px",
              }}
              onClick={showImageUploadModal}
            >
              Add Image
            </Button>
          )}

        {props.isSearch ? (
          <></>
        ) : (
          <StyledInput focused={false} label="Search" color="#ffffffa6" onChange={setSearchImage} defaultValue={""} />
        )}

        <div style={{ paddingTop: "10px" }}>{renderedElementList}</div>

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
});

const ElementIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
`;
