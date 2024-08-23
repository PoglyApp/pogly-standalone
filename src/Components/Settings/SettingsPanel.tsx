import { Box, Button, Checkbox, FormControlLabel, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { SettingsTabPanel } from "./SettingsTabPanel";

export const SettingsPanel = () => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
        <Tab label="General" />
        <Tab label="Advanced" />
        <Tab label="About" />
      </Tabs>
      <SettingsTabPanel value={value} index={0}>
        <TextField label="Nickname" variant="outlined" fullWidth margin="normal" />
        <TextField label="Tenor v2 API Key" variant="outlined" fullWidth margin="normal" />
        <FormControlLabel control={<Checkbox />} label="Debug mode" />
        <FormControlLabel control={<Checkbox defaultChecked />} label="Show cursor usernames" />
        <FormControlLabel control={<Checkbox />} label="Stream player interactable" />
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" fullWidth>
            Update Auth Token
          </Button>
          <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 1 }}>
            Clear Connection Settings
          </Button>
        </Box>
      </SettingsTabPanel>
      <SettingsTabPanel value={value} index={1}>
        {/* Advanced settings content */}
        <Typography variant="body1">Advanced settings can be configured here.</Typography>
      </SettingsTabPanel>
      <SettingsTabPanel value={value} index={2}>
        {/* About content */}
        <Typography variant="body1">Version 1.0.0</Typography>
        <Button variant="contained" color="primary" href="https://example.com">
          Grab the new version here
        </Button>
      </SettingsTabPanel>
    </Box>
  );
};
