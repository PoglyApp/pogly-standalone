import styled from "styled-components";
import { CircularProgress, Typography, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useState } from "react";

interface IProps {
  text: string;
  loadingStuckText?: boolean;
}

export const Loading = (props: IProps) => {
  const [showLoadingStuck, setShowLoadingStuck] = useState<boolean>(false);
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingStuck(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const clearConnection = () => {
    localStorage.removeItem("stdbConnectDomain");
    localStorage.removeItem("stdbConnectModule");
    localStorage.removeItem("stdbConnectModuleAuthKey");

    window.location.reload();
  };

  if (isOverlay) return <></>;

  return (
    <LoadingContainer>
      <div style={{ position: "absolute", top: "45%" }}>
        <Typography variant="h5" component="h1" color="white" paddingBottom={3}>
          {props.text}
        </Typography>
        <svg width={0} height={0}>
          <defs>
            <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00c8af" />
              <stop offset="100%" stopColor="#9146ff" />
            </linearGradient>
          </defs>
        </svg>
        <CircularProgress sx={{ "svg circle": { stroke: "url(#my_gradient)" } }} />
      </div>

      {showLoadingStuck && (
        <LoadingStuckContainer>
          {props.loadingStuckText && (
            <Typography variant="subtitle1" component="span" color="white" paddingBottom={3}>
              Loading seems to be taking longer than usual.
              <br />
              Please logout and verify your module, authentication key and domain.
            </Typography>
          )}
          <Button
            variant="text"
            sx={{
              color: "#ff0000c8",
              textTransform: "initial",
              padding: "0",
              width: "fit-content",
              justifySelf: "center",
            }}
            onClick={clearConnection}
          >
            <LogoutIcon sx={{ color: "#ff0000c8", marginRight: "5px" }} />
            Log Out
          </Button>
        </LoadingStuckContainer>
      )}
    </LoadingContainer>
  );
};
const LoadingContainer = styled.div`
  display: grid;

  width: 100vw;
  height: 100vh;

  text-align: center;

  justify-items: center;
  align-content: center;
`;

const LoadingStuckContainer = styled.div`
  display: grid;

  width: 600px;
  height: fit-content;

  margin-top: 300px;
`;
