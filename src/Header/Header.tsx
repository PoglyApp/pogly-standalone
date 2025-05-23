import { AppBar, Box, MenuItem, Tab, Tabs, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { SpacetimeContext } from "../Contexts/SpacetimeContext";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { setModals } = useContext(ModalContext);

  const { spacetimeDB } = useContext(SpacetimeContext);

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isDroppingSelectionMenu, setIsDroppingSelectionMenu] = useState(false);
  const [quickSwapMenuAnchor, setQuickSwapMenuAnchor] = useState<any>(null);
  const quickSwapMenuOpen = Boolean(quickSwapMenuAnchor);

  useEffect(() => {}, []);

  useEffect(() => {
    if (location.pathname !== "/login" && location.pathname !== "/" && !location.pathname.startsWith("/canvas") && !location.pathname.startsWith("/overlay")) {
      setIsRedirecting(true);
      window.location.href = "/";
    }
  }, [location, navigate]);

  const showSettingsMenu = () => {
    DebugLogger("Opening settings modal");
    setModals((oldModals: any) => [...oldModals, <SettingsModal key="settings_modal" />]);
  };

  const showEditorGuidelines = () => {
    DebugLogger("Opening editor guidelines modal");
    setModals((oldModals: any) => [...oldModals, <EditorGuidelineModal key="guideline_modal" />]);
  };

  if (location.pathname === "/canvas" && !spacetimeDB) return <Navigate to="/login" replace />;

  return isRedirecting ? null : location.pathname !== "/canvas" ? (
    <main>
      <Outlet />
    </main>
  ) : (
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
          onDragEnter={() => setIsDroppingSelectionMenu(true)}
          onDragLeave={() => setIsDroppingSelectionMenu(false)}
          onDropAccepted={() => setIsDroppingSelectionMenu(false)}
          onDropRejected={() => setIsDroppingSelectionMenu(false)}
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
