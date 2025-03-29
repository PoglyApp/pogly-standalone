import { useContext, useEffect, useRef, useState } from "react";
import { DebugLogger } from "../../Utility/DebugLogger";
import { EventContext, Layouts } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";

export const useOverlayLayoutEvents = (activeLayout: Layouts | undefined, setActiveLayout: Function) => {
  const { spacetimeDB } = useContext(SpacetimeContext);
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

    spacetimeDB.Client.db.layouts.onInsert((ctx: EventContext, newLayout: Layouts) => {
      //Nothing yet!
    });

    spacetimeDB.Client.db.layouts.onUpdate((ctx: EventContext, oldLayout: Layouts, newLayout: Layouts) => {
      if (oldLayout.active === false && newLayout.active === true && !layoutParam) {
        setActiveLayout(newLayout);
      }
    });

    spacetimeDB.Client.db.layouts.onDelete((ctx: EventContext, oldLayout: Layouts) => {
      if (!activeLayoutRef.current) return;
      if (oldLayout.id !== activeLayoutRef.current.id) return;

      setActiveLayout((Array.from(spacetimeDB.Client.db.layouts.iter()) as Layouts[]).find((l: Layouts) => l.active===true));
    });

    setEventsInitialized(true);
  }, [eventsInitialized, setActiveLayout, spacetimeDB.Client]);
};
