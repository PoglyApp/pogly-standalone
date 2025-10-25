import { useContext, useEffect, useState } from "react";
import Moveable, { OnDragGroup, OnRotateGroup } from "react-moveable";
import Selecto from "react-selecto";
import { updateElementTransform } from "../../StDB/Reducers/Update/updateElementTransform";
import { SelectedType } from "../../Types/General/SelectedType";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { Config } from "../../module_bindings";

interface IProp {
  transformSelect: any;
  selected?: SelectedType;
  moveableRef: React.RefObject<Moveable>;
  selectoRef: React.RefObject<Selecto>;
  selectoTargets: Array<SVGElement | HTMLElement>;
}

export const MoveableComponent = (props: IProp) => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const config: Config = spacetimeDB.Client.db.config.version.find(0);

  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [hasElementBeenWarped, sethasElementBeenWarped] = useState(false);

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
    if (!props.selected) return;
    const hasMatrix =
      document.getElementById(props.selected.Elements.id.toString())?.style.transform.includes("matrix") || false;
    sethasElementBeenWarped(hasMatrix);
  }, [props.selected]);

  const onTransformStop = (event: any) => {
    if (!event.isDrag || !props.selected) return;

    updateElementTransform(spacetimeDB.Client, props.selected.Elements.id, event.lastEvent.style.transform);
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
    if (!event || !event.lastEvent || !event.isDrag || !props.selected) return;

    switch (props.selected.Elements.element.tag) {
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

    updateElementTransform(spacetimeDB.Client, props.selected.Elements.id, event.target.style.transform);
  };

  let resizeWaitUntil = 0;

  const onResize = (event: any) => {
    if (!event || !props.selected) return;

    if (Date.now() < resizeWaitUntil) return;

    switch (props.selected.Elements.element.tag) {
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
    if (!props.selected) return;
    spacetimeDB.Client.reducers.updateElementClip(event.target.id, event.clipStyle);
  };

  return (
    <Moveable
      ref={props.moveableRef}
      target={props.selectoTargets}
      onClickGroup={(e) => {
        if (!props.selectoRef.current) return;
        props.selectoRef.current.clickTarget(e.inputEvent, e.inputTarget);
      }}
      keepRatio={isShiftPressed}
      origin={false}
      draggable={true}
      rotatable={true}
      // snappable={isShiftPressed && !isResize}
      // snapGridWidth={10}
      // snapGridHeight={10}
      resizable={
        true &&
        props.transformSelect.size &&
        props.selected?.Elements.element.tag !== "TextElement" &&
        !hasElementBeenWarped
      }
      warpable={true && props.transformSelect.warp}
      clippable={true && props.transformSelect.clip}
      clipTargetBounds
      throttleResize={1}
      throttleDrag={1}
      throttleRotate={1}
      // DRAG EVENTS
      onDrag={(event) => {
        event.target.style.transform = event.transform;
        onTransform(event);
      }}
      onDragEnd={(event) => onTransformStop(event)}
      onDragGroup={(e) => {
        onTransformMulti(e);
      }}
      // RESIZE EVENTS
      onResize={(event) => {
        event.target.style.width = `${event.width}px`;
        event.target.style.height = `${event.height}px`;
        event.target.style.transform = event.drag.transform;
        onResize(event);
      }}
      onResizeEnd={(event) => onResizeStop(event)}
      // onResizeGroup={(e) => {
      //   e.events.forEach((ev) => {
      //     ev.target.style.width = `${ev.width}px`;
      //     ev.target.style.height = `${ev.height}px`;
      //     ev.target.style.transform = ev.drag.transform;
      //     onResize(ev);
      //   });
      // }}

      // ROTATE EVENTS
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
      // WARP EVENTS
      onWarp={(event) => {
        event.target.style.transform = event.transform;
        onTransform(event);
      }}
      onWarpEnd={(event) => onTransformStop(event)}
      // CLIP EVENTS
      onClip={(event) => {
        event.target.style.clipPath = event.clipStyle;
        onClip(event);
      }}
    />
  );
};
