import { useEffect, useState } from "react";
import { DebugLogger } from "../../Utility/DebugLogger";
import { EventContext, Layouts } from "../../module_bindings";
import { getActiveLayout } from "../SpacetimeDBUtils";

export const useOverlayLayoutEvents = (spacetimeDB: any, setRefetchElements: Function) => {
  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (eventsInitialized || !spacetimeDB.Client) return;

    DebugLogger("Initializing overlay layout events");

    const urlParams = new URLSearchParams(window.location.search);
    const layoutParam = urlParams.get("layout");

    spacetimeDB.Client.db.layouts.onUpdate((ctx: EventContext, oldLayout: Layouts, newLayout: Layouts) => {
      if (oldLayout.active === false && newLayout.active === true && !layoutParam) {
        setRefetchElements(true);
      }
    });

    spacetimeDB.Client.db.layouts.onDelete((ctx: EventContext, oldLayout: Layouts) => {
      const activeLayout = getActiveLayout(spacetimeDB.Client);

      if (oldLayout.id !== activeLayout.id) return;

      setRefetchElements(true);
    });

    setEventsInitialized(true);
  }, [eventsInitialized, spacetimeDB.Client]);
};
