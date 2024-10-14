import { AppBar, Box, Button, Menu, MenuItem, Tab, Tabs, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Outlet, useNavigate } from "react-router-dom";
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
import { QuickSwapType } from "../Types/General/QuickSwapType";
import { useSpacetimeContext } from "../Contexts/SpacetimeContext";

interface IProps {
  activePage: Number;
  setActivePage: Function;
  onlineVersion: string;
}

export const Header = (props: IProps) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const currentModule = localStorage.getItem("stdbConnectModule") || "";

  const { Client } = useSpacetimeContext();

  const [isDroppingSelectionMenu, setisDroppingSelectionMenu] = useState<boolean>(false);

  const [quickSwapModules, setQuickSwapModules] = useState<QuickSwapType[]>([]);
  const [quickSwapMenuAnchor, setQuickSwapMenuAnchor] = useState<any>(null);
  const quickSwapMenuOpen = Boolean(quickSwapMenuAnchor);

  const { setModals } = useContext(ModalContext);

  useEffect(() => {
    const modules = localStorage.getItem("poglyQuickSwap");

    if (modules) setQuickSwapModules(JSON.parse(modules));
  }, []);

  const showSettingsMenu = () => {
    DebugLogger("Opening settings modal");
    setModals((oldModals: any) => [
      ...oldModals,
      <SettingsModal key="settings_modal" onlineVersion={props.onlineVersion} />,
    ]);
  };

  const showEditorGuidelines = () => {
    DebugLogger("Opening editor guidelines modal");
    setModals((oldModals: any) => [...oldModals, <EditorGuidelineModal key="guideline_modal" />]);
  };

  const swapModule = (module: QuickSwapType) => {
    DebugLogger("Swapping module via quick swap menu");
    localStorage.setItem("stdbConnectDomain", module.domain);
    localStorage.setItem("stdbConnectModule", module.module);
    localStorage.setItem("stdbConnectModuleAuthKey", module.auth);
    Client.disconnect();
    window.location.reload();
  };

  if (isOverlay) {
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

        <Menu
          id="quickswap-menu"
          anchorEl={quickSwapMenuAnchor}
          open={quickSwapMenuOpen}
          onClose={() => setQuickSwapMenuAnchor(null)}
          MenuListProps={{
            "aria-labelledby": "quickswap-button",
          }}
        >
          {quickSwapModules.length > 0 ? (
            quickSwapModules.map((module) => (
              <StyledMenuItem
                key={module.module}
                onClick={() => swapModule(module)}
                disabled={currentModule === module.module ? true : false}
              >
                {module.module}
              </StyledMenuItem>
            ))
          ) : (
            <span style={{ padding: "10px" }}>No saved modules</span>
          )}
        </Menu>
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
