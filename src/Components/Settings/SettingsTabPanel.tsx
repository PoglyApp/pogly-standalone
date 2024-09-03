import { Box, Typography } from "@mui/material";

interface IProp {
  children: any;
  value: any;
  index: any;
}

export const SettingsTabPanel = (props: IProp) => {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ paddingTop: "30px" }}>{children}</Box>}
    </div>
  );
};
