import { useContext, useState } from "react";
import { Dialog, DialogContent, DialogTitle, FormGroup, Button, DialogActions, Alert, InputLabel, Select, OutlinedInput, MenuItem, FormControl, Typography } from "@mui/material";
import { ModalContext } from "../../Contexts/ModalContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export type QuickSwap = {
  domain: string,
  module: string,
  auth: string
}

interface IProps {
  client: SpacetimeDBClient;
}

export const QuickSwapModal = (props: IProps) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);

  const [selected,setSelected] = useState<QuickSwap>();

  const clearSwapList = () => {
    localStorage.removeItem("poglyQuickSwap");
    closeModal("quickSwap_modal", modals, setModals);
  }

  const qSwap = localStorage.getItem("poglyQuickSwap");
  let modules: QuickSwap[] = [];
  try {
    if(qSwap) modules = JSON.parse(qSwap);
  } catch (error) {
    clearSwapList();
  }

  const handleSelection = (e: any) => {
    const swap = modules.find((m) => m.module === e.target.value);
    if(swap) setSelected(swap);
  }

  const handleOnClose = () => {
    DebugLogger("Closing quick swap modal");
    closeModal("quickSwap_modal", modals, setModals);
  };

  const swapModule = () => {
    if(!selected) return;
    DebugLogger("Swapping module via quick swap modal");
    localStorage.setItem("stdbConnectDomain", selected.domain);
    localStorage.setItem("stdbConnectModule", selected.module);
    localStorage.setItem("stdbConnectModuleAuthKey", selected.auth);
    props.client.disconnect();
    window.location.reload();
  }

  return (
    <Dialog 
        open={true} 
        onClose={handleOnClose}
        id="quickSwapModal"
        sx={{
            ".MuiDialog-paper": {
                height: "300px !important",
                width: "400px !important",
            }
        }}
    >
        <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6" }}>Quick-Swap</DialogTitle>
        <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px", paddingTop: "10px !important" }}>
            <FormControl
                  fullWidth
                  sx={{ "&:hover": { borderColor: "#ffffffa6 !important" }, marginBottom: "15px" }}
                >
                <InputLabel id="quickSwapLabel" sx={{ color: "#ffffffa6" }}>Module</InputLabel>
                <Select
                    value={selected}
                    onChange={handleSelection}
                    labelId="quickSwapLabel"
                    id="quickSwapLabel"
                    label="Module"
                    variant="outlined"
                    sx={{
                        "label + &": { color: "#ffffffa6" },
                        ".MuiOutlinedInput-notchedOutline ": { borderColor: "#ffffffa6", borderWidth: "2px" },
                        ".MuiSvgIcon-root": { fill: "#ffffffa6" },
                        "&:hover": {
                        "&& fieldset": {
                            borderColor: "#ffffffa6",
                        },
                        },
                    }}
                >
                    {modules && modules.map((module) => (
                        <MenuItem
                            key={module.module}
                            value={module.module}
                        >
                            {module.module}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Typography variant="body2" color="#ffffffa6">
              Connect with "Remember Me" option to add a module to the quick-swap list.
            </Typography>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: "#0a2a47", padding: "15px", display: "grid" }}>
        <div style={{ position: "fixed" }}>
          <Button
            variant="outlined"
            sx={{
              color: "#db8f00",
              borderColor: "#db8f00",
              "&:hover": { borderColor: "white" },
              marginRight: "10px",
            }}
            onClick={clearSwapList}
          >
            Clear
          </Button>
        </div>
        <div>
          <Button
            variant="outlined"
            sx={{
              color: "#ffffffa6",
              borderColor: "#ffffffa6",
              "&:hover": { borderColor: "white" },
              marginRight: "10px"
            }}
            onClick={handleOnClose}
          >
            Cancel
          </Button>
          <Button
            disabled={!selected ? true : false}
            variant="outlined"
            sx={{
              color: "#ffffffa6",
              borderColor: "#ffffffa6",
              "&:hover": { borderColor: "white" },
              "&:disabled": {
                borderColor: "gray",
                color: "gray",
              },
            }}
            onClick={swapModule}
          >
            Swap
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};
