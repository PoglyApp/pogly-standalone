import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { ChangelogType } from "../../Types/General/ChangelogType";
import { ChangeType } from "../../Types/General/ChangeType";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface IProps {
  changelog: ChangelogType | undefined;
  seenVersion: string;
  latestVersion: string;
}

export const ChangelogModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (!props.changelog) return;
    if (showModal) return;

    setShowModal(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.changelog]);

  const handleOnClose = () => {
    localStorage.setItem("changelog", props.latestVersion);
    closeModal("changelog_modal", modals, setModals);
  };

  if (isOverlay) return <></>;

  return (
    <>
      {showModal && props.changelog && (
        <Dialog fullWidth={true} open={true} onClose={handleOnClose}>
          <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Changelog</DialogTitle>
          <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
            {props.changelog.changes.map((e: ChangeType) => (
              <Accordion defaultExpanded={e.version === props.latestVersion} key={e.version}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  sx={{
                    color: "#ffffffa6",
                    backgroundColor: "#03192e",
                  }}
                >
                  <Typography sx={{ color: "#ffffffa6" }} variant="h6">
                    {"v" + e.version}
                    {e.version === props.latestVersion && props.latestVersion !== props.seenVersion ? (
                      <Badge
                        badgeContent="NEW"
                        color="primary"
                        sx={{
                          left: "0",
                          paddingLeft: "25px",
                          paddingBottom: "3px",
                          ".MuiBadge-badge": { backgroundColor: "#e53e3e" },
                        }}
                      />
                    ) : (
                      <></>
                    )}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: "#031e38",
                    paddingBottom: "5px",
                  }}
                >
                  <List dense={true} disablePadding={true}>
                    {e.log.map((log) => {
                      return (
                        <ListItem divider={true} key={log.title}>
                          <ListItemText
                            primaryTypographyProps={{ sx: { color: "#ffffffa6", fontWeight: "bold" } }}
                            secondaryTypographyProps={{ sx: { color: "#ffffffa6" } }}
                            primary={log.title}
                            secondary={log.description}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </DialogContent>
          <DialogActions
            sx={{ backgroundColor: "#0a2a47", paddingTop: "25px", paddingBottom: "20px", display: "grid" }}
          >
            <Button
              variant="outlined"
              sx={{
                color: "#ffffffa6",
                borderColor: "#ffffffa6",
                "&:hover": { borderColor: "white" },
                marginRight: "10px",
              }}
              onClick={handleOnClose}
            >
              Okay
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
