import { Accordion, AccordionDetails, AccordionSummary, Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
import Layouts from "../../../module_bindings/layouts";
import useFetchLayours from "../../../StDB/Hooks/useFetchLayouts";
import CheckIcon from "@mui/icons-material/Check";
import { useContext, useState } from "react";
import { ModalContext } from "../../../Contexts/ModalContext";
import { LayoutCreationModal } from "../../Modals/LayoutCreationModal";
import { useLayoutEvents } from "../../../StDB/Hooks/useLayoutEvents";
import { HandleLayoutSelectionContextMenu } from "../../../Utility/HandleContextMenu";
import { LayoutContextMenu } from "../ContextMenus/LayoutContextMenu";
import styled from "styled-components";

interface IProps {
  activeLayout: Layouts;
  setActiveLayout: Function;
}

export const LayoutCategory = (props: IProps) => {
  const { setModals } = useContext(ModalContext);
  const [layouts, setLayouts] = useState<Layouts[]>([]);

  const [contextMenu, setContextMenu] = useState<any>(null);

  useFetchLayours(setLayouts);
  useLayoutEvents(setLayouts);

  const showLayoutCreationModal = () => {
    setModals((oldModals: any) => [...oldModals, <LayoutCreationModal key="layoutCreation_modal" />]);
  };

  return (
    <>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{
            color: "#ffffffa6",
            height: "2px !important",
          }}
        >
          <AddToQueueIcon sx={{ marginRight: "5px" }} />
          <LayoutTitle>Layouts {"(" + props.activeLayout.name + ")"}</LayoutTitle>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "#000c17",
            paddingBottom: "5px",
          }}
        >
          <Button
            variant="text"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              color: "#ffffffa6",
              textTransform: "initial",
            }}
            onClick={showLayoutCreationModal}
          >
            Add Layout
          </Button>

          {layouts!.map((layout: Layouts) => {
            return (
              <div
                id={layout.id + "_layout"}
                key={layout.id + "_layout"}
                onContextMenu={(event: any) => {
                  HandleLayoutSelectionContextMenu(event, setContextMenu, contextMenu, layout);
                }}
              >
                <Button
                  variant="text"
                  sx={{
                    color: "#ffffffa6",
                    textTransform: "initial",
                    justifyContent: "left",
                  }}
                  onClick={() => {
                    props.setActiveLayout(layout);
                  }}
                >
                  {layout.name}
                  <CheckIcon
                    id={layout.id + "_layout_icon"}
                    sx={{ color: "green", marginLeft: "3px", display: `${layout.active ? "unset" : "none"}` }}
                  />
                </Button>
              </div>
            );
          })}
        </AccordionDetails>
      </Accordion>

      <LayoutContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu} />
    </>
  );
};

const LayoutTitle = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  width: 160px;
  height: 1.2em;
  white-space: nowrap;

  line-height: 1.5;
  font-size: 15px;
`;
