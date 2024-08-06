import { useEffect, useState } from "react";
import Layouts from "../../module_bindings/layouts";

export const useOverlayLayoutEvents = (setActiveLayout: Function) => {
  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (eventsInitialized) return;

    Layouts.onInsert((newLayout) => {});

    Layouts.onUpdate((oldLayout, newLayout) => {
      if (oldLayout.active === false && newLayout.active === true) {
        setActiveLayout(newLayout);
      }
    });

    Layouts.onDelete((layout) => {});

    setEventsInitialized(true);
  }, [eventsInitialized]);
};
