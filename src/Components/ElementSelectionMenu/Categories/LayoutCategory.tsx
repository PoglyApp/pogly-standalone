import { Accordion, AccordionDetails, AccordionSummary, Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
import Layouts from "../../../module_bindings/layouts";
import useFetchLayouts from "../../../StDB/Hooks/useFetchLayouts";
import CheckIcon from "@mui/icons-material/Check";
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../../Contexts/ModalContext";
import { LayoutCreationModal } from "../../Modals/LayoutCreationModal";
import { useLayoutEvents } from "../../../StDB/Hooks/useLayoutEvents";
import { HandleLayoutSelectionContextMenu } from "../../../Utility/HandleContextMenu";
import { LayoutContextMenu } from "../ContextMenus/LayoutContextMenu";
import styled from "styled-components";
import { LayoutContext } from "../../../Contexts/LayoutContext";
import { DebugLogger } from "../../../Utility/DebugLogger";
import UpdateGuestSelectedLayoutReducer from "../../../module_bindings/update_guest_selected_layout_reducer";
import PermissionLevel from "../../../module_bindings/permission_level";
import Config from "../../../module_bindings/config";
import Permissions from "../../../module_bindings/permissions";
import { useSpacetimeContext } from "../../../Contexts/SpacetimeContext";

export const LayoutCategory = () => {
  const { setModals } = useContext(ModalContext);
  const layoutContext = useContext(LayoutContext);
  const { Identity } = useSpacetimeContext();

  const [layouts, setLayouts] = useState<Layouts[]>([]);
  const [contextMenu, setContextMenu] = useState<any>(null);

  const strictMode: boolean = Config.findByVersion(0)!.strictMode;
  const permissions: PermissionLevel | undefined = Permissions.findByIdentity(Identity.identity)?.permissionLevel;

  useFetchLayouts(setLayouts);
  useLayoutEvents(setLayouts);

  const changeLayout = (layout: Layouts) => {
    UpdateGuestSelectedLayoutReducer.call(layout.id);
    layoutContext.setActiveLayout(layout);
  };

  const showLayoutCreationModal = () => {
    DebugLogger("Opening layout creation modal");
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
          }}
        >
          <AddToQueueIcon sx={{ marginRight: "5px" }} />
          <LayoutName>Layouts ({layoutContext.activeLayout.name})</LayoutName>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "#000c17",
            paddingBottom: "5px",
          }}
        >
          {strictMode && permissions && (
            <Button
              variant="text"
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                color: "#ffffffa6",
                textTransform: "initial",
                justifyContent: "left",
                width: "100%",
              }}
              onClick={showLayoutCreationModal}
            >
              Add Layout
            </Button>
          )}

          {!strictMode && (
            <Button
              variant="text"
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                color: "#ffffffa6",
                textTransform: "initial",
                justifyContent: "left",
                width: "100%",
              }}
              onClick={showLayoutCreationModal}
            >
              Add Layout
            </Button>
          )}

          {layouts.map((layout: Layouts) => {
            return (
              <div
                id={layout.id + "_layout"}
                key={layout.id + "_layout"}
                onContextMenu={(event: any) => {
                  HandleLayoutSelectionContextMenu(event, setContextMenu, contextMenu, layout);
                }}
              >
                <Button
                  id={layout.id + "_layout_button"}
                  variant="text"
                  sx={{
                    color: "#ffffffa6",
                    textTransform: "initial",
                    justifyContent: "left",
                    width: "100%",
                    border: layoutContext.activeLayout.id === layout.id ? "solid 2px #022440" : "solid 2px #000C17",
                  }}
                  onClick={() => {
                    changeLayout(layout);
                  }}
                >
                  {layout.name}
                  <CheckIcon
                    id={layout.id + "_layout_icon"}
                    sx={{ color: "green", marginLeft: "3px", display: `${layout.active ? "unset" : "none"}` }}
                    titleAccess="Active Layout"
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

const LayoutName = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  height: 1.2em;
  width: 130px;
  white-space: nowrap;

  line-height: 1.5;
  font-size: 15px;
`;
