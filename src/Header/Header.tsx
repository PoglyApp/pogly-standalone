import { AppBar, Box, MenuItem, Tab, Tabs, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { GuestListContainer } from "../Components/Containers/GuestListContainer";
import { SettingsModal } from "../Components/Modals/SettingModals";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
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
import { VerifyOwnershipModal } from "../Components/Modals/VerifyOwnershipModal";
import { useGetVersionNumber } from "../Hooks/useGetVersionNumber";
import { Settings } from "../Components/Settings/Settings";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { setModals } = useContext(ModalContext);
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isDroppingSelectionMenu, setIsDroppingSelectionMenu] = useState(false);
  const [quickSwapMenuAnchor, setQuickSwapMenuAnchor] = useState<any>(null);
  const quickSwapMenuOpen = Boolean(quickSwapMenuAnchor);

  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [showVerificationButton, setShowVerificationButton] = useState<boolean>(false);

  useEffect(() => {
    if (location.pathname.startsWith("/overlay") || !spacetimeDB) return;

    const heartBeat = spacetimeDB.Client?.db.heartbeat.id.find(0);
    const config = spacetimeDB.Client?.db.config.version.find(0);

    if (config?.ownerIdentity.toHexString() === heartBeat?.serverIdentity.toHexString())
      setShowVerificationButton(true);
  }, [spacetimeDB]);

  useEffect(() => {
    if (
      location.pathname !== "/login" &&
      location.pathname !== "/" &&
      !location.pathname.startsWith("/canvas") &&
      !location.pathname.startsWith("/overlay")
    ) {
      setIsRedirecting(true);
      window.location.href = "/";
    }
  }, [location, navigate]);

  const showEditorGuidelines = () => {
    DebugLogger("Opening editor guidelines modal");
    setModals((oldModals: any) => [...oldModals, <EditorGuidelineModal key="guideline_modal" />]);
  };

  const showVerifyOwnershipModal = () => {
    setModals((oldModals: any) => [...oldModals, <VerifyOwnershipModal key="verifyownership_modal" />]);
  };

  if (location.pathname === "/canvas" && !spacetimeDB) return <Navigate to="/login" replace />;

  return isRedirecting ? null : location.pathname !== "/canvas" ? (
    <main>
      <Outlet />
    </main>
  ) : (
    <>
      <StyledBox className="canvas-font">
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
                <StyledTab
                  icon={<SettingsIcon />}
                  iconPosition="start"
                  label="Settings"
                  onClick={() => setShowSettings(!showSettings)}
                />
                <StyledGuidelines
                  icon={<SecurityIcon />}
                  iconPosition="start"
                  label="Editor Guidelines"
                  onClick={showEditorGuidelines}
                />

                {showVerificationButton && (
                  <StyledNoOwner
                    icon={<ReportGmailerrorredIcon />}
                    iconPosition="start"
                    label="Verify ownership!"
                    onClick={showVerifyOwnershipModal}
                  />
                )}
              </Tabs>
            </Box>

            <GuestListContainer />
          </Toolbar>
        </AppBar>

        <Settings visible={showSettings} setVisible={setShowSettings} />

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

const StyledNoOwner = styled(Tab)`
  text-transform: none !important;
  color: red !important;

  border: 1px solid red !important;
  border-radius: 15px !important;

  background-color: #ff00002b !important;

  &:hover {
    background-color: #ff000058 !important;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  &:hover {
    background-color: #ff000058 !important;
  }
`;
