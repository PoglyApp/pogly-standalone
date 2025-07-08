import { useContext, useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { CursorsContainer } from "../Components/Containers/CursorsContainer";
import { MoveableComponent } from "../Components/General/MoveableComponent";
import StreamContainer from "../Components/Containers/StreamContainer";
import { useElementDataEvents } from "../StDB/Hooks/useElementDataEvents";
import { useElementsEvents } from "../StDB/Hooks/useElementsEvents";
import useFetchElement from "../StDB/Hooks/useFetchElements";
import useFetchGuests from "../StDB/Hooks/useFetchGuests";
import { useGuestsEvents } from "../StDB/Hooks/useGuestsEvents";
import { useAppSelector } from "../Store/Features/store";
import { CanvasElementType } from "../Types/General/CanvasElementType";
import { SelectedType } from "../Types/General/SelectedType";
import { Loading } from "../Components/General/Loading";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { SelectoComponent } from "../Components/General/SelectoComponent";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import { ElementContextMenu } from "../Components/Elements/ContextMenus/ElementContextMenu";
import { HandleElementContextMenu } from "../Utility/HandleContextMenu";
import { CanvasInitializedType } from "../Types/General/CanvasInitializedType";
import { useHeartbeatEvents } from "../StDB/Hooks/useHeartbeatEvents";
import { useNotice } from "../Hooks/useNotice";
import { Notice } from "../Components/General/Notice";
import { ErrorRefreshModal } from "../Components/Modals/ErrorRefreshModal";
import { LayoutContext } from "../Contexts/LayoutContext";
import { useHotkeys } from "reakeys";
import { UserInputHandler } from "../Utility/UserInputHandler";
import { SettingsContext } from "../Contexts/SettingsContext";
import { DebugLogger } from "../Utility/DebugLogger";
import { useConfigEvents } from "../StDB/Hooks/useConfigEvents";
import { SpacetimeContext } from "../Contexts/SpacetimeContext";
import { EditorGuidelineModal } from "../Components/Modals/EditorGuidelineModal";
import { Config, Elements, Layouts, PermissionLevel } from "../module_bindings";
import { useNavigate } from "react-router-dom";

export const Canvas = () => {
  const [canvasInitialized, setCanvasInitialized] = useState<CanvasInitializedType>({
    elementsFetchInitialized: false,
    elementEventsInitialized: false,
    elementDataEventsInitialized: false,
    guestFetchInitialized: false,
    guestEventsInitialized: false,
  });

  const navigate = useNavigate();
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const { activeLayout, setActiveLayout } = useContext(LayoutContext);
  const { settings } = useContext(SettingsContext);
  const { spacetimeDB } = useContext(SpacetimeContext);

  if (!spacetimeDB || !activeLayout) navigate("/", { replace: true });

  const [permission, setPermission] = useState<PermissionLevel>();

  const moveableRef = useRef<Moveable>(null);
  const selectoRef = useRef<Selecto>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const [selectoTargets, setSelectoTargets] = useState<Array<SVGElement | HTMLElement>>([]);
  const [selected, setSelected] = useState<SelectedType | undefined>(undefined);

  const [contextMenu, setContextMenu] = useState<any>(null);

  const [transformSelect, setTransformSelect] = useState<any>({
    size: true,
    warp: false,
    clip: false,
  });

  const [noticeMessage, setNoticeMessage] = useState<any>();

  const elements: Elements[] = useAppSelector((state: any) => state.elements.elements);
  const canvasElements: CanvasElementType[] = useAppSelector((state: any) => state.canvasElements.canvasElements);

  const initGuidelineAccept = () => {
    if (isOverlay) return true;
    if (permission && permission.tag === "Owner") return true;
    if (localStorage.getItem("Accept_EditorGuidelines")) return true;
    return false;
  };

  const [acceptedGuidelines, setAcceptedGuidelines] = useState<boolean>(initGuidelineAccept);

  useFetchElement(activeLayout, canvasInitialized, setCanvasInitialized);

  useElementDataEvents(canvasInitialized, setCanvasInitialized);
  useElementsEvents(
    selectoRef,
    selected,
    setSelected,
    setSelectoTargets,
    canvasInitialized,
    setCanvasInitialized,
    activeLayout
  );

  const userDisconnected = useGuestsEvents(canvasInitialized, setCanvasInitialized, transformRef);
  useFetchGuests(canvasInitialized, setCanvasInitialized);

  useHeartbeatEvents(canvasInitialized);
  const configReload = useConfigEvents(canvasInitialized);

  useNotice(setNoticeMessage);

  useHotkeys(
    UserInputHandler(
      spacetimeDB.Client,
      activeLayout,
      selected,
      selectoTargets,
      settings.compressPaste,
      transformRef.current
    )
  );

  useEffect(() => {
    if (permission) return;

    setPermission(spacetimeDB.Client.db.permissions.identity.find(spacetimeDB.Identity.identity)?.permissionLevel);
  }, []);

  useEffect(() => {
    if (!activeLayout) {
      DebugLogger("Setting active layout");
      setActiveLayout(
        (Array.from(spacetimeDB.Client.db.layouts.iter()) as Layouts[]).find((l: Layouts) => l.active === true)
      );
    }

    DebugLogger("Layout context updated");

    setSelected(undefined);
    setSelectoTargets(() => []);

    spacetimeDB.Client.reducers.updateGuestSelectedElement(0);
  }, [activeLayout, setActiveLayout, spacetimeDB.Client]);

  // Limit how many times cursor event is updated
  let waitUntil = 0;

  const onMouseMove = (event: any) => {
    if (!transformRef.current) return;

    var streamRect = document.getElementById("stream")?.getBoundingClientRect();
    if (Date.now() < waitUntil || !streamRect) return;

    const x = (event.clientX - streamRect.left) / transformRef.current.instance.transformState.scale;
    const y = (event.clientY - streamRect.top) / transformRef.current.instance.transformState.scale;

    spacetimeDB.Client.reducers.updateGuestPosition(x, y);

    waitUntil = Date.now() + 1000 / spacetimeDB.Config.updateHz;
  };

  if (userDisconnected || spacetimeDB.Disconnected) {
    DebugLogger("Guest is disconnected");
    return (
      <ErrorRefreshModal
        type="button"
        buttonText="Reload"
        titleText="Disconnected"
        contentText="You have been disconnected from the Pogly instance."
        clearSettings={false}
      />
    );
  }

  if (configReload) {
    DebugLogger("Config has been updated");
    return (
      <ErrorRefreshModal
        type="timer"
        refreshTimer={3}
        titleText="Config changed by Owner"
        contentText="This Pogly instance's config settings have been changed by the owner. The module is reloading automatically..."
        clearSettings={false}
      />
    );
  }

  if (!acceptedGuidelines) {
    DebugLogger("Guest has not accepted guidelines");
    return <EditorGuidelineModal key="guideline_modal" setAcceptedGuidelines={setAcceptedGuidelines} />;
  }

  return (
    <div className="mouseContainer" onMouseMove={onMouseMove}>
      {Object.values(canvasInitialized).every((init) => init === true) && activeLayout ? (
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
          {noticeMessage && <Notice noticeMessage={noticeMessage} setNoticeMessage={setNoticeMessage} />}

          <TransformComponent
            contentProps={{ id: "transformContainer" }}
            wrapperStyle={{ width: "100vw", height: "100vh" }}
            contentClass="grid-bg"
          >
            <Container>
              <div
                id="streamContent"
                className="streamContent"
                style={{
                  height: 1080,
                  marginTop: -607,
                  width: 1920,
                  marginLeft: -742,
                  zIndex: 0,
                  position: "fixed",
                  left: "50%",
                  top: "50%",
                }}
              >
                <div className="elementContent">
                  {canvasElements.map((element: CanvasElementType) => {
                    return (
                      <div
                        key={element.Elements.id.toString() + "_" + element.Elements.element.tag}
                        onContextMenu={(event: any) => {
                          HandleElementContextMenu(event, setContextMenu, contextMenu, element.Elements);

                          setSelected({
                            Elements: element.Elements,
                            Component: element.Component,
                          });
                        }}
                      >
                        {element.Component}
                      </div>
                    );
                  })}
                </div>
                <CursorsContainer />
                <StreamContainer
                  moduleName={spacetimeDB.Runtime.module}
                  platform={spacetimeDB.Config.streamingPlatform}
                  streamName={spacetimeDB.Config.streamName}
                />
              </div>
            </Container>

            <MoveableComponent
              transformSelect={transformSelect}
              selected={selected}
              moveableRef={moveableRef}
              selectoRef={selectoRef}
              selectoTargets={selectoTargets}
            />
          </TransformComponent>

          <ElementContextMenu
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            canvasElements={canvasElements}
            setTransformSelect={setTransformSelect}
            setSelected={setSelected}
            setSelectoTargets={setSelectoTargets}
          />

          <SelectoComponent
            selectoRef={selectoRef}
            moveableRef={moveableRef}
            selectoTargets={selectoTargets}
            setSelectoTargets={setSelectoTargets}
            setSelected={setSelected}
            elements={elements}
          />
        </TransformWrapper>
      ) : (
        <Loading text="Initializing Canvas" />
      )}
    </div>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
