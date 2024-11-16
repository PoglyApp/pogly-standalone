import { StreamContainer } from "@/components/containers/StreamContainer";
import { useRef } from "react";
import { ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export const Canvas: React.FC = () => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  return (
    <>
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
            <div
              style={{
                height: 1080,
                marginTop: -607,
                width: 1920,
                marginLeft: -742,
                position: "fixed",
                zIndex: "-1",
                left: "50%",
                top: "50%",
              }}
            >
              <StreamContainer />
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </>
  );
};
