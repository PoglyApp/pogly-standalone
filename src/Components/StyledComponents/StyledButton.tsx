import { Button, TextField } from "@mui/material";

interface IProps {
  disabled: boolean;
  label: string;
  textColor: string;
  backgroundColor: string;
  hoverColor: string;
  onClick: Function;
}

export const StyledButton = (props: IProps) => {
  return (
    <Button
      disabled={props.disabled}
      sx={{
        color: props.textColor,
        backgroundColor: props.backgroundColor,
        padding: "10px",
        marginBottom: "10px",
        "&:hover": { backgroundColor: props.hoverColor },
        textTransform: "initial",
      }}
      onClick={() => props.onClick()}
    >
      {props.label}
    </Button>
  );
};
