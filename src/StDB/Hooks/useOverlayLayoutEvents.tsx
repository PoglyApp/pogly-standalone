import { useEffect, useRef, useState } from "react";
import { DebugLogger } from "../../Utility/DebugLogger";
import { EventContext, Layouts } from "../../module_bindings";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";

export const useOverlayLayoutEvents = (activeLayout: Layouts | undefined, setActiveLayout: Function) => {
  const { Client } = useSpacetimeContext();
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

    Client.db.layouts.onInsert((ctx: EventContext, newLayout: Layouts) => {
      //Nothing yet!
    });

    Client.db.layouts.onUpdate((ctx: EventContext, oldLayout: Layouts, newLayout: Layouts) => {
      if (oldLayout.active === false && newLayout.active === true && !layoutParam) {
        setActiveLayout(newLayout);
      }
    });

    Client.db.layouts.onDelete((ctx: EventContext, oldLayout: Layouts) => {
      if (!activeLayoutRef.current) return;
      if (oldLayout.id !== activeLayoutRef.current.id) return;

      setActiveLayout(Array.from(Client.db.layouts.iter()).find((l: Layouts) => l.active===true));
    });

    setEventsInitialized(true);
  }, [eventsInitialized, setActiveLayout, Client]);
};
