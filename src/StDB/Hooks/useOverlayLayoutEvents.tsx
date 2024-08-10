import { useEffect, useState } from "react";
import Layouts from "../../module_bindings/layouts";

export const useOverlayLayoutEvents = (setActiveLayout: Function) => {
  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (eventsInitialized) return;

    const urlParams = new URLSearchParams(window.location.search);
    const layoutParam = urlParams.get("layout");

    Layouts.onInsert((newLayout) => {});

    Layouts.onUpdate((oldLayout, newLayout) => {
      if (oldLayout.active === false && newLayout.active === true && !layoutParam) {
        setActiveLayout(newLayout);
      }
    });

    Layouts.onDelete((layout) => {});

    setEventsInitialized(true);
  }, [eventsInitialized]);
};
