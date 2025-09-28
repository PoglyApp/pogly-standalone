import { useRef } from "react";
import { PoglyTitle } from "./Components/PoglyTitle";
import { StreamContainer } from "./Components/StreamContainer";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { ZoomContainer } from "./Components/ZoomContainer";
import { LayoutsContainer } from "./Components/LayoutsContainer";
import { LayersContainer } from "./Components/LayersContainter";
import { Footer } from "./Components/Footer";
import { ElementPicker } from "./Components/ElementPicker";
import { Settings } from "./Components/Settings";

export const Canvas = () => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  return (
    <div className="w-full h-full absolute">
      <div className="absolute z-1000">
        <PoglyTitle />
        <LayoutsContainer />
        <LayersContainer />

        <div className="flex fixed w-full bottom-0  mb-[18px] justify-between">
          <Footer />
          <ElementPicker />
          <Settings />
        </div>
      </div>

      <ZoomContainer transformRef={transformRef}>
        <div id="streamContainer" className="relative w-[1920px] h-[1080px]">
          <StreamContainer />
        </div>
      </ZoomContainer>
    </div>
  );
};
