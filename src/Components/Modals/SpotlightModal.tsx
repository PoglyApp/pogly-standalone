import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormGroup,
  } from "@mui/material";
  import { useContext, useEffect, useMemo, useState } from "react";
  import { ModalContext } from "../../Contexts/ModalContext";
  import { ConfigContext } from "../../Contexts/ConfigContext";
  import { DebugLogger } from "../../Utility/DebugLogger";
import { StyledInput } from "../StyledComponents/StyledInput";
import Config from "../../module_bindings/config";
import Permissions from "../../module_bindings/permissions";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import ElementData from "../../module_bindings/element_data";
import { useAppSelector } from "../../Store/Features/store";
import { shallowEqual } from "react-redux";
import { ImageCategory } from "../ElementSelectionMenu/Categories/ImageCategory";
import { ChannelEmoteCategory } from "../ElementSelectionMenu/Categories/ChannelEmoteCategory";
    
  export const SpotlightModal = () => {
    const { Identity } = useSpacetimeContext();
    const { modals, setModals, closeModal } = useContext(ModalContext);
    const config = useContext(ConfigContext);
    const isOverlay: Boolean = window.location.href.includes("/overlay");

    const [searchTerm, setSearchTerm] = useState<string>("");
    
    const handleOnClose = () => {
      DebugLogger("Handling backup modal close");
      closeModal("spotlight_modal", modals, setModals);
    };

    const [contextMenu, setContextMenu] = useState<any>(null);

    const strictMode = useMemo(() => Config.findByVersion(0)!.strictMode, []);
    const permissionLevel = useMemo(
      () => Permissions.findByIdentity(Identity.identity)?.permissionLevel,
      [Identity.identity]
    );

    const elementData: ElementData[] = useAppSelector((state: any) => state.elementData.elementData, shallowEqual);
    const memoizedData = useMemo(() => elementData, [elementData]);

    const memoizedStrictSettings = useMemo(
      () => ({
        StrictMode: strictMode,
        Permission: permissionLevel,
      }),
      [strictMode, permissionLevel]
    );
  
    if (isOverlay) return <></>;
  
    return (
      <Dialog open={true} onClose={handleOnClose} sx={{ 
        ".MuiDialog-paper": {
          height: "600px !important",
          width: "400px !important"
        },
      }}>
        <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Search</DialogTitle>
        <DialogContent sx={{ backgroundColor: "#0a2a47", paddingTop: "10px !important", paddingBottom: "10px !important" }}>
          <FormGroup>
            <StyledInput
                focused={true}
                label="Element"
                color="#ffffffa6"
                onChange={setSearchTerm}
                defaultValue=""
                style={{ width: "100%" }}
              />

              <ImageCategory
                elementData={memoizedData}
                strictSettings={memoizedStrictSettings}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                isSearch={true}
                searchTerm={searchTerm}
              />

              {config.streamingPlatform === "twitch" && <ChannelEmoteCategory isSearch={true} searchTerm={searchTerm} />}
          </FormGroup>
        </DialogContent>
      </Dialog>
    );
  };
  