import { useContext, useEffect, useState } from "react";
import Moveable, { OnDragGroup, OnRotateGroup } from "react-moveable";
import Selecto from "react-selecto";
import { updateElementTransform } from "../../StDB/Reducers/Update/updateElementTransform";
import { SelectedType } from "../../Types/General/SelectedType";
import Config from "../../module_bindings/config";
import { SettingsContext } from "../../Contexts/SettingsContext";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { GetCoordsFromTransform } from "../../Utility/ConvertCoordinates";
import UpdateWidgetElementSizeReducer from "../../module_bindings/update_widget_element_size_reducer";
import UpdateImageElementSizeReducer from "../../module_bindings/update_image_element_size_reducer";
import { DebugLogger } from "../../Utility/DebugLogger";

interface IProp {
  transformSelect: any;
  selected?: SelectedType;
  moveableRef: React.RefObject<Moveable>;
  selectoRef: React.RefObject<Selecto>;
  selectoTargets: Array<SVGElement | HTMLElement>;
}

export const MoveableComponent = (props: IProp) => {
  const { settings } = useContext(SettingsContext);
  const config: Config = useContext(ConfigContext);

  const debugText = document.getElementById("debug-text" + props.selected?.Elements.id);
  const stream = document.getElementById("stream")?.getBoundingClientRect();

  const [isShiftPressed, setIsShiftPressed] = useState(false);
  //const [isResize, setIsResize] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Shift") {
        DebugLogger("Shift is being pressed");
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: any) => {
      if (event.key === "Shift") {
        DebugLogger("Shift is let go");
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!debugText) return;

    if (!settings.debug) {
      DebugLogger("Hide debug text");
      debugText.style.display = "none";
    } else {
      DebugLogger("Show debug text");
      debugText.style.display = "Inline";
    }
  }, [settings.debug, debugText]);

  const onTransformStop = (event: any) => {
    if (!event.isDrag || !props.selected) return;

    DebugLogger("Updating element transform");

    updateElementTransform(props.selected.Elements.id, event.lastEvent.style.transform);
  };

  let transformWaitUntil = 0;

  const onTransform = (event: any) => {
    //if (!props.selected) return;

    if (Date.now() < transformWaitUntil) return;

    if (settings.debug && debugText) {
      if (!stream) return;
      const bounds = event.target.getBoundingClientRect();

      const insideStream =
        bounds.right >= stream.left &&
        bounds.left <= stream.right &&
        bounds.bottom >= stream.top &&
        bounds.top <= stream.bottom;

      const coords = GetCoordsFromTransform(event.target.style.transform);

      debugText.innerHTML = `Pos: ${coords.x},${coords.y}<br />Vis: ${insideStream}`;
    }

    updateElementTransform(
      //props.selected.Elements.id,
      event.target.id,
      event.target.style.transform
    );

    transformWaitUntil = Date.now() + 1000 / config.updateHz;
  };

  let transformMultiWaitUntil = 0;

  const onTransformMulti = (e: OnDragGroup | OnRotateGroup) => {
    if (Date.now() < transformMultiWaitUntil) return;

    e.events.forEach((ev) => {
      ev.target.style.transform = ev.transform;
      updateElementTransform(parseInt(ev.target.id), ev.target.style.transform);
    });

    transformMultiWaitUntil = Date.now() + 1000 / config.updateHz;
  };

  const onResizeStop = (event: any) => {
    //setIsResize(false);
    if (!event.isDrag || !props.selected) return;

    if (!event) return;

    if (!event.lastEvent) return;

    DebugLogger("Updating element size");

    switch (props.selected.Elements.element.tag) {
      case "ImageElement":

        UpdateImageElementSizeReducer.call(event.target.id, event.lastEvent.width, event.lastEvent.height);
        break;

      case "WidgetElement":

        UpdateWidgetElementSizeReducer.call(event.target.id, event.lastEvent.width, event.lastEvent.height);
        break;
    }

    updateElementTransform(props.selected.Elements.id, event.target.style.transform);
  };

  let resizeWaitUntil = 0;

  const onResize = (event: any) => {
    //setIsResize(true);
    if (!props.selected) return;

    if (!event) return;

    if (Date.now() < resizeWaitUntil) return;

    switch (props.selected.Elements.element.tag) {
      case "ImageElement":

        UpdateImageElementSizeReducer.call(event.target.id, event.width, event.height);
        break;

      case "WidgetElement":

        UpdateWidgetElementSizeReducer.call(event.target.id, event.width, event.height);
        break;
    }

    updateElementTransform(event.target.id, event.target.style.transform);

    resizeWaitUntil = Date.now() + 1000 / config.updateHz;
  };

  const onClip = (event: any) => {
    if (!props.selected) return;
    //updateElementClip(props.selected.Elements.id, event.style.clipPath);
  };

  const onClipStop = (event: any) => {
    if (!event.isDrag || !props.selected) return;
    //updateElementClip(props.selected.Elements.id, event.lastEvent.style.clipPath);
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
      resizable={true && props.transformSelect.size && props.selected?.Elements.element.tag !== "TextElement"}
      // warpable={true && props.transformSelect.warp}
      // clippable={true && props.transformSelect.clip}
      warpable={false}
      clippable={false}
      throttleResize={1}
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
      onClipEnd={(event) => onClipStop(event)}
    />
  );
};
