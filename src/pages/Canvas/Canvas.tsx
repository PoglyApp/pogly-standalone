import { useContext, useEffect, useRef, useState } from "react";
import { PoglyTitle } from "./Components/PoglyTitle";
import { StreamContainer } from "./Components/StreamContainer";
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { ZoomContainer } from "./Components/ZoomContainer";
import { LayoutsContainer } from "./Components/LayoutsContainer";
import { LayersContainer } from "./Components/LayersContainter";
import { Footer } from "./Components/Footer";
import { ElementPicker } from "./Components/ElementPicker/ElementMenu";
import { SettingsButton } from "./Components/Settings/SettingsButton";
import { Details } from "./Components/Details";
import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Settings } from "@/Pages/Canvas/Components/Settings/Settings";
import { UserList } from "./Components/UserList";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import { MoveableComponent } from "./Components/Elements/MoveableComponent";
import { SelectoComponent } from "./Components/Elements/SelectoComponent";
import { Elements } from "@/module_bindings";
import { useFetchElements } from "@/StDB/Hooks/useFetchElements";

export const Canvas = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const { spacetimeDB } = useContext(SpacetimeContext);

  const [elements, setElements] = useState<Elements[]>([]);
  const [elementComponents, setElementComponents] = useState<JSX.Element[]>([]);

  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const moveableRef = useRef<Moveable>(null);
  const selectoRef = useRef<Selecto>(null);

  const [selectoTargets, setSelectoTargets] = useState<Array<SVGElement | HTMLElement>>([]);
  const [selected, setSelected] = useState<Elements | undefined>(undefined);

  const [transformType, setTransformType] = useState<any>({
    size: true,
    warp: false,
    clip: false,
  });

  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);

  useFetchElements(spacetimeDB, setElements, setElementComponents);

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
        <div>
          {elementComponents.map((element: JSX.Element, index: number) => {
            console.log(element);
            return <div key={`${index}_CANVAS_COMPONENT`}>{element}</div>;
          })}
        </div>

        <StreamContainer />

        <MoveableComponent
          elements={selected}
          transformType={transformType}
          moveableRef={moveableRef}
          selectoRef={selectoRef}
          selectoTargets={selectoTargets}
        />

        <SelectoComponent
          elements={elements}
          moveableRef={moveableRef}
          selectoRef={selectoRef}
          selectoTargets={selectoTargets}
          setSelectoTargets={setSelectoTargets}
          setSelected={setSelected}
        />
      </ZoomContainer>
    </div>
  );
};
