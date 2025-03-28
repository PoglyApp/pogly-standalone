import { AppBar, Box, MenuItem, Tab, Tabs, Typography } from "@mui/material";
import { useContext, useState } from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import { GuestListContainer } from "../Components/Containers/GuestListContainer";
import { SettingsModal } from "../Components/Modals/SettingModals";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import Toolbar from "@mui/material/Toolbar";
import { ModalContext } from "../Contexts/ModalContext";
import { DebugLogger } from "../Utility/DebugLogger";
import { EditorGuidelineModal } from "../Components/Modals/EditorGuidelineModal";
import Dropzone from "react-dropzone";
import { HandleDragAndDropFiles } from "../Utility/HandleDragAndDropFiles";
import { ElementSelectionMenu } from "../Components/ElementSelectionMenu/ElementSelectionMenu";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { QuickSwapMenu } from "./QuickswapMenu";

export const Header = () => {
  const isCanvas: Boolean = window.location.href.includes("/canvas");

  const [isDroppingSelectionMenu, setisDroppingSelectionMenu] = useState<boolean>(false);

  const [quickSwapMenuAnchor, setQuickSwapMenuAnchor] = useState<any>(null);
  const quickSwapMenuOpen = Boolean(quickSwapMenuAnchor);

  const { setModals } = useContext(ModalContext);

  const showSettingsMenu = () => {
    DebugLogger("Opening settings modal");
    setModals((oldModals: any) => [...oldModals, <SettingsModal key="settings_modal" />]);
  };

  const showEditorGuidelines = () => {
    DebugLogger("Opening editor guidelines modal");
    setModals((oldModals: any) => [...oldModals, <EditorGuidelineModal key="guideline_modal" />]);
  };

  if (!isCanvas) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }

  return (
    <>
      <StyledBox>
        <AppBar position="static">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#ffffffa6",
                minWidth: "218px",
                textAlign: "center",
              }}
            >
              <span style={{ color: "#ffffffd9" }}>Pogly</span> Standalone
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={0}
                sx={{
                  ".Mui-selected": { backgroundColor: "#001529 !important" },
                  ".MuiTabs-indicator": { backgroundColor: "#001529 !important" },
                }}
              >
                <StyledTab
                  id="quickswap-button"
                  aria-controls={quickSwapMenuOpen ? "quickswap-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={quickSwapMenuOpen ? "true" : undefined}
                  icon={<SwapHorizIcon />}
                  iconPosition="start"
                  label="Swap module"
                  onClick={(event: any) => setQuickSwapMenuAnchor(event.currentTarget)}
                />
                <StyledTab icon={<SettingsIcon />} iconPosition="start" label="Settings" onClick={showSettingsMenu} />
                <StyledGuidelines
                  icon={<SecurityIcon />}
                  iconPosition="start"
                  label="Editor Guidelines"
                  onClick={showEditorGuidelines}
                />
              </Tabs>
            </Box>

            <GuestListContainer />
          </Toolbar>
        </AppBar>
        <Dropzone
          onDrop={(acceptedFiles) => HandleDragAndDropFiles(acceptedFiles, setModals)}
          noClick={true}
          onDragEnter={() => setisDroppingSelectionMenu(true)}
          onDragLeave={() => setisDroppingSelectionMenu(false)}
          onDropAccepted={() => setisDroppingSelectionMenu(false)}
          onDropRejected={() => setisDroppingSelectionMenu(false)}
        >
          {({ getRootProps }) => (
            <div {...getRootProps()}>
              <ElementSelectionMenu isDropping={isDroppingSelectionMenu} />
            </div>
          )}
        </Dropzone>

        <QuickSwapMenu
          quickSwapMenuAnchor={quickSwapMenuAnchor}
          quickSwapMenuOpen={quickSwapMenuOpen}
          setQuickSwapMenuAnchor={setQuickSwapMenuAnchor}
        />
      </StyledBox>
      <main>
        <Outlet />
      </main>
    </>
  );
};

const StyledBox = styled(Box)`
  width: 100%;
  background-color: #001529;
`;

const StyledTab = styled(Tab)`
  text-transform: none !important;

  &:hover {
    background-color: #020e1a !important;
  }
`;

const StyledGuidelines = styled(Tab)`
  text-transform: none !important;
  color: #e6b559 !important;

  &:hover {
    background-color: #020e1a !important;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  &:hover {
    background-color: #020e1a !important;
  }
`;
