import { useContext, useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { ElementSelectionMenu } from "../Components/ElementSelectionMenu/ElementSelectionMenu";
import { CursorsContainer } from "../Components/Containers/CursorsContainer";
import { MoveableComponent } from "../Components/General/MoveableComponent";
import { StreamContainer } from "../Components/Containers/StreamContainer";
import Elements from "../module_bindings/elements";
import { useElementDataEvents } from "../StDB/Hooks/useElementDataEvents";
import { useElementsEvents } from "../StDB/Hooks/useElementsEvents";
import useFetchElement from "../StDB/Hooks/useFetchElements";
import useFetchGuests from "../StDB/Hooks/useFetchGuests";
import { useGuestsEvents } from "../StDB/Hooks/useGuestsEvents";
import { initCanvasElements } from "../Store/Features/CanvasElementSlice";
import { useAppDispatch, useAppSelector } from "../Store/Features/store";
import { CanvasElementType } from "../Types/General/CanvasElementType";
import { SelectedType } from "../Types/General/SelectedType";
import { CreateElementComponent } from "../Utility/CreateElementComponent";
import Config from "../module_bindings/config";
import ElementData from "../module_bindings/element_data";
import { Loading } from "../Components/General/Loading";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { SelectoComponent } from "../Components/General/SelectoComponent";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import { ElementContextMenu } from "../Components/Elements/ContextMenus/ElementContextMenu";
import { HandleElementContextMenu } from "../Utility/HandleContextMenu";
import { CanvasInitializedType } from "../Types/General/CanvasInitializedType";
import { useHeartbeatEvents } from "../StDB/Hooks/useHeartbeatEvents";
import { ConfigContext } from "../Contexts/ConfigContext";
import UpdateGuestPositionReducer from "../module_bindings/update_guest_position_reducer";
import { useNotice } from "../Hooks/useNotice";
import { Notice } from "../Components/General/Notice";

interface IProps {
  setActivePage: Function;
  canvasInitialized: CanvasInitializedType;
  setCanvasInitialized: Function;
}

export const Canvas = (props: IProps) => {
  const config: Config = useContext(ConfigContext);

  const dispatch = useAppDispatch();

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

  const elementData: ElementData[] = useAppSelector((state: any) => state.elementData.elementData);
  const elements: Elements[] = useAppSelector((state: any) => state.elements.elements);
  const canvasElements: CanvasElementType[] = useAppSelector((state: any) => state.canvasElements.canvasElements);

  useFetchElement(props.canvasInitialized, props.setCanvasInitialized);

  useElementDataEvents(props.canvasInitialized, props.setCanvasInitialized);
  useElementsEvents(selectoRef, setSelected, setSelectoTargets, props.canvasInitialized, props.setCanvasInitialized);

  useGuestsEvents(props.canvasInitialized, props.setCanvasInitialized, transformRef);
  useFetchGuests(props.canvasInitialized, props.setCanvasInitialized);

  useHeartbeatEvents(props.canvasInitialized);

  useNotice(setNoticeMessage);

  useEffect(() => {
    props.setActivePage(1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.canvasInitialized.canvasInitialized) return;

    // INITIALIZE CANVAS
    const canvasElements: CanvasElementType[] = [];

    elements.forEach((element: Elements) => {
      canvasElements.push(CreateElementComponent(element));
    });

    dispatch(initCanvasElements(canvasElements));
    props.setCanvasInitialized((init: CanvasInitializedType) => ({ ...init, canvasInitialized: true }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  // Limit how many times cursor event is updated
  let waitUntil = 0;

  const onMouseMove = (event: any) => {
    if (!transformRef.current) return;

    var streamRect = document.getElementById("stream")?.getBoundingClientRect();
    if (Date.now() < waitUntil || !streamRect) return;

    const x = (event.clientX - streamRect.left) / transformRef.current.instance.transformState.scale;
    const y = (event.clientY - streamRect.top) / transformRef.current.instance.transformState.scale;

    UpdateGuestPositionReducer.call(x, y);

    waitUntil = Date.now() + 1000 / config.updateHz;
  };

  return (
    <>
      {Object.values(props.canvasInitialized).every((init) => init === true) ? (
        <>
          <ElementSelectionMenu elementData={elementData} />

          {noticeMessage && <Notice noticeMessage={noticeMessage} setNoticeMessage={setNoticeMessage} />}

          <TransformWrapper
            ref={transformRef}
            limitToBounds={true}
            centerOnInit={true}
            initialScale={2.25}
            centerZoomedOut={true}
            minScale={1}
            maxScale={4}
            pinch={{ disabled: true }}
            panning={{
              wheelPanning: true,
              allowLeftClickPan: false,
              allowRightClickPan: false,
            }}
            doubleClick={{ disabled: true }}
            smooth={false}
            wheel={{
              step: 0.1,
            }}
          >
            <TransformComponent
              contentProps={{ id: "transformContainer" }}
              wrapperStyle={{ display: "flex", flex: 1, marginLeft: "218px" }}
              contentStyle={{ display: "flex", flex: 1 }}
              contentClass="grid-bg"
            >
              <Container className="mouseContainer" onMouseMove={onMouseMove}>
                <div
                  id="streamContent"
                  className="streamContent"
                  style={{
                    height: 270,
                    marginTop: -175,
                    width: 480,
                    marginLeft: -280,
                    zIndex: 0,
                    position: "fixed",
                    left: "50%",
                    top: "50%",
                  }}
                >
                  <div className="elementContent" style={{ position: "absolute" }}>
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
                          style={{ cursor: "context-menu" }}
                        >
                          {element.Component}
                        </div>
                      );
                    })}
                  </div>
                  <CursorsContainer />
                  <StreamContainer />
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
          </TransformWrapper>

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
        </>
      ) : (
        <Loading text="Initializing Canvas" />
      )}
    </>
  );
};

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`;
