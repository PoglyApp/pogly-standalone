import { PropsWithChildren, Ref } from "react";
import { ReactZoomPanPinchContentRef, TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

interface IProps {
  transformRef: Ref<ReactZoomPanPinchContentRef> | undefined;
}

export const ZoomContainer = ({ transformRef, children }: PropsWithChildren<IProps>) => {
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
      >
        {children}
      </TransformComponent>
    </TransformWrapper>
  );
};
