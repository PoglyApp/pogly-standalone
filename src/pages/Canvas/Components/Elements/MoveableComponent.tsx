import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { Config, Elements } from "@/module_bindings";
import { updateElementTransform } from "@/StDB/Reducers/Update/updateElementTransform";
import { useContext, useEffect, useState } from "react";
import Moveable, { OnDragGroup, OnRotateGroup } from "react-moveable";
import Selecto from "react-selecto";

interface IProps {
  elements: Elements | undefined;
  transformType: any;
  moveableRef: React.RefObject<Moveable>;
  selectoRef: React.RefObject<Selecto>;
  selectoTargets: Array<SVGElement | HTMLElement>;
}

export const MoveableComponent = ({ elements, transformType, moveableRef, selectoRef, selectoTargets }: IProps) => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const config: Config = spacetimeDB.Client.db.config.version.find(0);

  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
  const [hasElementBeenWarped, sethasElementBeenWarped] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.repeat) return;

      if (event.key === "Shift") {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: any) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!elements) return;

    const hasMatrix = document.getElementById(elements.id.toString())?.style.transform.includes("matrix") || false;

    sethasElementBeenWarped(hasMatrix);
  }, [elements]);

  const onTransformStop = (event: any) => {
    if (!event.isDrag || !elements) return;

    updateElementTransform(spacetimeDB.Client, elements.id, event.lastEvent.style.transform);
  };

  let transformWaitUntil = 0;

  const onTransform = (event: any) => {
    if (Date.now() < transformWaitUntil) return;

    updateElementTransform(spacetimeDB.Client, event.target.id, event.target.style.transform);

    transformWaitUntil = Date.now() + 1000 / config.updateHz;
  };

  let transformMultiWaitUntil = 0;

  const onTransformMulti = (e: OnDragGroup | OnRotateGroup) => {
    if (Date.now() < transformMultiWaitUntil) return;

    e.events.forEach((ev) => {
      ev.target.style.transform = ev.transform;
      updateElementTransform(spacetimeDB.Client, parseInt(ev.target.id), ev.target.style.transform);
    });

    transformMultiWaitUntil = Date.now() + 1000 / config.updateHz;
  };

  const onResizeStop = (event: any) => {
    if (!event || !event.lastEvent || !event.isDrag || !elements) return;

    switch (elements.element.tag) {
      case "ImageElement":
        spacetimeDB.Client.reducers.updateImageElementSize(
          event.target.id,
          event.lastEvent.width,
          event.lastEvent.height
        );
        break;

      case "WidgetElement":
        spacetimeDB.Client.reducers.updateWidgetElementSize(
          event.target.id,
          event.lastEvent.width,
          event.lastEvent.height
        );
        break;
    }

    updateElementTransform(spacetimeDB.Client, elements.id, event.target.style.transform);
  };

  let resizeWaitUntil = 0;

  const onResize = (event: any) => {
    if (!event || !elements) return;

    if (Date.now() < resizeWaitUntil) return;

    switch (elements.element.tag) {
      case "ImageElement":
        spacetimeDB.Client.reducers.updateImageElementSize(event.target.id, event.width, event.height);
        break;

      case "WidgetElement":
        spacetimeDB.Client.reducers.updateWidgetElementSize(event.target.id, event.width, event.height);
        break;
    }

    updateElementTransform(spacetimeDB.Client, event.target.id, event.target.style.transform);

    resizeWaitUntil = Date.now() + 1000 / config.updateHz;
  };

  const onClip = (event: any) => {
    if (!elements) return;
    spacetimeDB.Client.reducers.updateElementClip(event.target.id, event.clipStyle);
  };

  if (!elements) return null;

  return (
    <Moveable
      ref={moveableRef}
      target={selectoTargets}
      onClickGroup={(e) => {
        if (!selectoRef.current) return;
        selectoRef.current.clickTarget(e.inputEvent, e.inputTarget);
      }}
      keepRatio={isShiftPressed}
      origin={false}
      draggable={true}
      rotatable={true}
      resizable={true && transformType.size && elements.element.tag !== "TextElement" && !hasElementBeenWarped}
      warpable={true && transformType.warp}
      clippable={true && transformType.clip}
      clipTargetBounds
      throttleResize={1}
      throttleDrag={1}
      throttleRotate={1}
      onDrag={(event) => {
        event.target.style.transform = event.transform;
        onTransform(event);
      }}
      onDragEnd={(event) => onTransformStop(event)}
      onDragGroup={(e) => {
        onTransformMulti(e);
      }}
      onResize={(event) => {
        event.target.style.width = `${event.width}px`;
        event.target.style.height = `${event.height}px`;
        event.target.style.transform = event.drag.transform;
        onResize(event);
      }}
      onResizeEnd={(event) => onResizeStop(event)}
      onRotate={(event) => {
        event.target.style.transform = event.drag.transform;
        onTransform(event);
      }}
      onRotateEnd={(event) => {
        onTransformStop(event);
      }}
      onRotateGroup={(e) => {
        onTransformMulti(e);
      }}
      onWarp={(event) => {
        event.target.style.transform = event.transform;
        onTransform(event);
      }}
      onWarpEnd={(event) => onTransformStop(event)}
      onClip={(event) => {
        event.target.style.clipPath = event.clipStyle;
        onClip(event);
      }}
    />
  );
};
