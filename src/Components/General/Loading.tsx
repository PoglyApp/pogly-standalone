import { CircularProgress, Typography } from "@mui/material";
import styled from "styled-components";

interface IProps {
  text: string;
}

export const Loading = (props: IProps) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  
  if(isOverlay) return (<></>);
  
  return (
    <Container>
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
      <CircularProgress  sx={{ 'svg circle': {stroke: 'url(#my_gradient)' } }}/>
    </Container>
  );
};

const Container = styled.div`
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translateX(-50%) translateY(-50%);
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;
