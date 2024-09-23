import { AppBar, Box, MenuItem, Tab, Tabs, Typography } from "@mui/material";
import { useContext } from "react";
import styled from "styled-components";
import { Outlet, useNavigate } from "react-router-dom";
import { GuestListContainer } from "../Components/Containers/GuestListContainer";
import { SettingsModal } from "../Components/Modals/SettingModals";
import HomeIcon from "@mui/icons-material/Home";
import SecurityIcon from '@mui/icons-material/Security';
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import SettingsIcon from "@mui/icons-material/Settings";
import Toolbar from "@mui/material/Toolbar";
import { ModalContext } from "../Contexts/ModalContext";
import { DebugLogger } from "../Utility/DebugLogger";
import { EditorGuidelineModal } from "../Components/Modals/EditorGuidelineModal";

interface IProps {
  activePage: Number;
  setActivePage: Function;
  onlineVersion: string;
}

export const Header = (props: IProps) => {
  const navigate = useNavigate();
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const { setModals } = useContext(ModalContext);

  const changePage = (pageIndex: number, path: string) => {
    if (props.activePage === pageIndex) return;

    DebugLogger("Changing page");

    props.setActivePage(pageIndex);
    navigate(path);
  };

  const showSettingsMenu = () => {
    DebugLogger("Opening settings modal");
    setModals((oldModals: any) => [
      ...oldModals,
      <SettingsModal key="settings_modal" onlineVersion={props.onlineVersion} />,
    ]);
  };

  const showEditorGuidelines = () => {
    DebugLogger("Opening editor guidelines modal");
    setModals((oldModals: any) => [
      ...oldModals,
      <EditorGuidelineModal key="guideline_modal" />,
    ]);
  }

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
              <Tabs value={props.activePage}>
                {/* TODO: Home page*/}
                <StyledTab
                  disabled
                  icon={<HomeIcon />}
                  iconPosition="start"
                  label="Home"
                  onClick={() => changePage(0, "/")}
                  sx={{ backgroundColor: "#000e1b" }}
                />
                <StyledTab
                  icon={<FormatPaintIcon />}
                  iconPosition="start"
                  label="Canvas"
                  onClick={() => changePage(1, "/canvas")}
                />
                <StyledTab icon={<SettingsIcon />} iconPosition="start" label="Settings" onClick={showSettingsMenu} />
                <StyledGuidelines icon={<SecurityIcon />} iconPosition="start" label="Editor Guidelines" onClick={showEditorGuidelines} />
              </Tabs>
            </Box>

            <GuestListContainer />
          </Toolbar>
        </AppBar>
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
`;

const StyledGuidelines = styled(Tab)`
  text-transform: none !important;
  color: #e6b559 !important;
  `;

const StyledMenuItem = styled(MenuItem)`
  background-color: #001529;
`;
