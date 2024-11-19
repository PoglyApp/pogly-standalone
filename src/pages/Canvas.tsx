import { CanvasContainer } from "@/components/canvas/CanvasContainer";
import { StreamContainer } from "@/components/containers/StreamContainer";
import { useRef } from "react";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

export const Canvas: React.FC = () => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  return (
    <CanvasContainer transformRef={transformRef}>
      <StreamContainer />
    </CanvasContainer>
  );
};
