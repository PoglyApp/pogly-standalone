import { useContext, useEffect, useRef, useState } from "react";
import { PoglyTitle } from "./Components/PoglyTitle";
import { StreamContainer } from "./Components/StreamContainer";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { ZoomContainer } from "./Components/ZoomContainer";
import { LayoutsContainer } from "./Components/LayoutsContainer";
import { LayersContainer } from "./Components/LayersContainter";
import { Footer } from "./Components/Footer";
import { ElementPicker } from "./Components/ElementPicker";
import { SettingsButton } from "./Components/Settings/SettingsButton";
import { Details } from "./Components/Details";
import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Settings } from "@/Pages/Canvas/Components/Settings/Settings";
import { UserList } from "./Components/UserList";

export const Canvas = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const { spacetimeDB } = useContext(SpacetimeContext);

  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || !auth.user) return navigate("/", { replace: true });

    const preferred =
      (auth.user.profile as any)?.preferred_username ||
      auth.user.profile?.name ||
      auth.user.profile?.sub ||
      "Unknown user";

    spacetimeDB.Client.reducers.updateGuestNickname(preferred);
  }, [spacetimeDB]);

  if (!spacetimeDB) return null;

  return (
    <div className="w-full h-full absolute">
      <div className="editor-overlay absolute z-1000 w-full h-full">
        <div>
          <PoglyTitle />
          <UserList />
        </div>
        <LayoutsContainer />
        <LayersContainer />
        <Details />

        <div className="editor-overlay flex fixed w-full bottom-0 mb-8 justify-between">
          <Footer />
          <ElementPicker />
          <SettingsButton settingsVisible={settingsVisible} setSettingsVisible={setSettingsVisible} />
        </div>
      </div>

      <Settings visible={settingsVisible} setVisible={setSettingsVisible} />

      <ZoomContainer transformRef={transformRef}>
        <div id="streamContainer" className="relative w-[1920px] h-[1080px]">
          <StreamContainer />
        </div>
      </ZoomContainer>
    </div>
  );
};
