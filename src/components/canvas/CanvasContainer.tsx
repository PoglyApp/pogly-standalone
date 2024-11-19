import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import styled from "styled-components";

interface IProps {
  children: any;
  transformRef: any;
}

export const CanvasContainer = ({ children, transformRef }: IProps) => {
  return (
    <TransformWrapper
      ref={transformRef}
      limitToBounds={false}
      centerOnInit={true}
      initialScale={0.5}
      centerZoomedOut={false}
      minScale={0.05}
      maxScale={4}
      panning={{
        wheelPanning: true,
        allowLeftClickPan: false,
        allowRightClickPan: false,
        allowMiddleClickPan: true,
      }}
      doubleClick={{ disabled: true }}
      smooth={true}
      wheel={{
        step: 0.1,
      }}
    >
      <TransformComponent
        contentProps={{ id: "transformContainer" }}
        wrapperStyle={{ width: "100vw", height: "100vh" }}
        contentClass="grid-bg"
      >
        <div style={{ width: "100%", height: "100%" }}>
          <Container>{children}</Container>
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
};

const Container = styled.div`
  height: 1080px;
  margin-top: -540px;
  width: 1920px;
  margin-left: -960px;
  position: fixed;
  z-index: -1;
  left: 50%;
  top: 50%;
`;
