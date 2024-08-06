import { Accordion, AccordionDetails, AccordionSummary, Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
import Layouts from "../../../module_bindings/layouts";
import useFetchLayours from "../../../StDB/Hooks/useFetchLayouts";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect } from "react";

interface IProps {
  activeLayout: Layouts;
  setActiveLayout: Function;
}

export const LayoutCategory = (props: IProps) => {
  const layouts = useFetchLayours();

  useEffect(() => {
    console.log(layouts);
  }, [layouts]);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "#ffffffa6" }} />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{
          color: "#ffffffa6",
          height: "2px !important",
        }}
      >
        <AddToQueueIcon sx={{ marginRight: "5px" }} />
        <span style={{ lineHeight: 1.5, fontSize: "15px" }}>Layouts</span>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: "#000c17",
          paddingBottom: "5px",
        }}
      >
        <Button
          variant="text"
          startIcon={<AddCircleOutlineIcon />}
          sx={{
            color: "#ffffffa6",
            textTransform: "initial",
          }}
          onClick={() => {}}
        >
          Add Layout
        </Button>

        {layouts?.map((layout: Layouts) => {
          return (
            <div key={layout.id + "_layout"}>
              <Button
                variant="text"
                sx={{
                  color: "#ffffffa6",
                  textTransform: "initial",
                  justifyContent: "left",
                }}
                onClick={() => {}}
              >
                {layout.name}
                {layout.active && <CheckIcon sx={{ color: "green", marginLeft: "3px" }} />}
              </Button>
            </div>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};
