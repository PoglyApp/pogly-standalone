import { useEffect, useRef, useState } from "react";
import Layouts from "../../module_bindings/layouts";
import { DebugLogger } from "../../Utility/DebugLogger";

export const useOverlayLayoutEvents = (activeLayout: Layouts | undefined, setActiveLayout: Function) => {
  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);
  const activeLayoutRef = useRef<Layouts | undefined>(activeLayout);

  useEffect(() => {
    DebugLogger("Updating overlay layout event refs");
    activeLayoutRef.current = activeLayout;
  }, [activeLayout]);

  useEffect(() => {
    if (eventsInitialized) return;

    DebugLogger("Initializing overlay layout events");

    const urlParams = new URLSearchParams(window.location.search);
    const layoutParam = urlParams.get("layout");

    Layouts.onInsert((newLayout) => {});

    Layouts.onUpdate((oldLayout, newLayout) => {
      if (oldLayout.active === false && newLayout.active === true && !layoutParam) {
        setActiveLayout(newLayout);
      }
    });

    Layouts.onDelete((layout) => {
      if (!activeLayoutRef.current) return;
      if (layout.id !== activeLayoutRef.current.id) return;

      setActiveLayout(Layouts.filterByActive(true).next().value);
    });

    setEventsInitialized(true);
  }, [eventsInitialized, setActiveLayout]);
};
