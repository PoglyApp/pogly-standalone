import { AppBar, Box, Tab, Tabs, Typography } from "@mui/material";
import { useContext } from "react";
import styled from "styled-components";
import { Outlet, useNavigate } from "react-router-dom";
import { GuestListContainer } from "../Components/Containers/GuestListContainer";
import { SettingsModal } from "../Components/Modals/SettingModals";

import HomeIcon from "@mui/icons-material/Home";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import SettingsIcon from "@mui/icons-material/Settings";
import Toolbar from "@mui/material/Toolbar";
import { ModalContext } from "../Contexts/ModalContext";
import DeleteAllElementsReducer from "../module_bindings/delete_all_elements_reducer";
import DeleteAllElementDataReducer from "../module_bindings/delete_all_element_data_reducer";
import RefreshOverlayReducer from "../module_bindings/refresh_overlay_reducer";
import RefreshOverlayClearStorageReducer from "../module_bindings/refresh_overlay_clear_storage_reducer";

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

    props.setActivePage(pageIndex);
    navigate(path);
  };

  const showSettingsMenu = () => {
    setModals((oldModals: any) => [
      ...oldModals,
      <SettingsModal key="settings_modal" onlineVersion={props.onlineVersion} />,
    ]);
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
              </Tabs>
            </Box>

            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
              <StyledMenuItem onClick={handleDeleteAllElements}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete all Elements
              </StyledMenuItem>

              <StyledMenuItem onClick={handleDeleteAllElementData}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete all Element Data
              </StyledMenuItem>

              <StyledMenuItem onClick={() => RefreshOverlayReducer.call()}>
                <ListItemIcon>
                  <RefreshIcon fontSize="small" color="success" />
                </ListItemIcon>
                Force refresh overlay
              </StyledMenuItem>

              <StyledMenuItem onClick={() => RefreshOverlayClearStorageReducer.call()}>
                <ListItemIcon>
                  <RefreshIcon fontSize="small" color="success" />
                </ListItemIcon>
                Force refresh overlay & Delete LocalStorage
              </StyledMenuItem>
            </Menu>

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
