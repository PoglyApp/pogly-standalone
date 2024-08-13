import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import Layouts from "../../module_bindings/layouts";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteLayoutReducer from "../../module_bindings/delete_layout_reducer";
import styled from "styled-components";
import { toast } from "react-toastify";

interface IProp {
  layout: Layouts;
}

export const LayoutDeletionConfirmationModal = (props: IProp) => {
  const { modals, setModals, closeModal } = useContext(ModalContext);

  const isOverlay: Boolean = window.location.href.includes("/overlay");

  const [preserveElements, setPreserveElements] = useState<boolean>(false);
  const [preserveTo, setPreserveTo] = useState<number>(1);

  const [layouts, setLayouts] = useState<Layouts[]>();

  useEffect(() => {
    const fetchedLayouts = Layouts.all();

    setLayouts(() =>
      fetchedLayouts.sort((a: any, b: any) => {
        return a.id - b.id;
      })
    );
  }, []);

  const handleDeleteLayout = () => {
    const doesLayoutStillExist = Layouts.filterById(preserveTo).next().value;

    if (!doesLayoutStillExist) {
      return toast.error("Selected layout for preserve no longer exists, select a different one and try again.", {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "dark",
      });
    }

    DeleteLayoutReducer.call(props.layout.id, preserveElements, preserveTo);
    handleOnClose();
  };

  const handleOnClose = () => {
    closeModal("layoutDeletionConfirmationModal_modal", modals, setModals);
  };

  if (isOverlay) return <></>;

  return (
    <Dialog open={true} onClose={handleOnClose}>
      <DialogTitle sx={{ backgroundColor: "#0a2a47", color: "#ffffffa6", textAlign: "center" }}>
        {"Are you sure you want to delete " + props.layout.name + "?"}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#0a2a47", paddingBottom: "3px" }}>
        <DialogContentText sx={{ color: "#ffffffa6", textAlign: "center", paddingBottom: "8px" }}>
          Any elements in this layout will be deleted and cannot be recovered.
        </DialogContentText>

        <FormGroup sx={{ alignItems: "center", color: "#ffffffa6" }}>
          <FormControlLabel
            control={
              <Checkbox
                sx={{ color: "#ffffffa6" }}
                checked={preserveElements}
                onChange={() => setPreserveElements(!preserveElements)}
              />
            }
            label="Perserve elements?"
          />

          {preserveElements && (
            <FormControl sx={{ width: "200px", marginBottom: "10px", marginTop: "10px" }}>
              <InputLabel id="layout_select" sx={{ color: "#ffffffa6", "&.Mui-focused": { color: "#ffffffa6" } }}>
                Layout
              </InputLabel>
              <StyledSelect
                labelId="layout_select"
                value={preserveTo}
                label="Layout"
                onChange={(event: any) => setPreserveTo(event.target.value)}
                sx={{
                  ".MuiStandardInput-notchedOutline": { borderColor: "#ffffffa6" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffffa6" },
                  ".MuiSvgIcon-root": { fill: "#ffffffa6" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffffffa6",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffffffa6",
                  },
                  marginRight: "5px !important",
                  marginTop: "0px !important",
                }}
              >
                {layouts?.map((layout: Layouts) => {
                  if (layout.id === props.layout.id) return <></>;

                  return (
                    <MenuItem key={layout.name + "_preserve_layout"} value={layout.id}>
                      {layout.name}
                    </MenuItem>
                  );
                })}
              </StyledSelect>
            </FormControl>
          )}
        </FormGroup>

        <center>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            sx={{
              color: "#ff5238",
              borderColor: "#ff5238",
              "&:hover": { borderColor: "#b23927" },
              marginTop: "10px",
              marginBottom: "20px",
            }}
            onClick={handleDeleteLayout}
          >
            {"Delete " + props.layout.name}
          </Button>
        </center>
      </DialogContent>
    </Dialog>
  );
};

const StyledSelect = styled(Select)`
  color: #ffffffa6;
  margin-left: 0px;

  &:after {
    border-width: 0;
  }

  &:before {
    border-width: 0;
  }
`;
