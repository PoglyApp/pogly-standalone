import { useEffect, useRef, useState } from "react";
import Layouts from "../../module_bindings/layouts";

export const useOverlayLayoutEvents = (activeLayout: Layouts | undefined, setActiveLayout: Function) => {
  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);
  const activeLayoutRef = useRef<Layouts | undefined>(activeLayout);

  useEffect(() => {
    activeLayoutRef.current = activeLayout;
  }, [activeLayout]);

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

    Layouts.onDelete((layout) => {
      if (layout.id !== activeLayoutRef.current!.id) return;

      setActiveLayout(Layouts.filterByActive(true).next().value);
    });

    setEventsInitialized(true);
  }, [eventsInitialized, setActiveLayout]);
};
