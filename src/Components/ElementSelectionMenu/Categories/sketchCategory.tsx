import { Accordion, AccordionDetails, AccordionSummary, Button, SvgIcon } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BrushIcon from "@mui/icons-material/Brush";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { useContext } from "react";
import { SketchContext } from "../../../Contexts/SketchContext";

export const SketchCategory = () => {
  const { sketchConfig, setSketchConfig } = useContext(SketchContext);

  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{
            color: "#ffffffa6",
          }}
        >
          <BrushIcon />
          <span style={{ lineHeight: 1.5, fontSize: "15px", marginLeft: "5px" }}>Sketch</span>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "#000c17",
            paddingBottom: "5px",
            maxHeight: "800px",
            overflowY: "scroll",
            overflowX: "hidden",
            "::-webkit-scrollbar": { width: "0", background: "transparent" },
          }}
        >
          <Button
            variant="text"
            sx={{
              color: "#ffffffa6",
              textTransform: "initial",
              paddingLeft: "20px",
              fontSize: "15px",
              justifyContent: "left",
              width: "100%",
            }}
            onClick={() => {
              setSketchConfig({ ...sketchConfig, drawing: !sketchConfig.drawing });
            }}
          >
            Toggle drawing
            {sketchConfig.drawing ? (
              <CheckIcon sx={{ color: "green", marginLeft: "3px" }} />
            ) : (
              <ClearIcon sx={{ color: "red", marginLeft: "3px" }} />
            )}
          </Button>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
