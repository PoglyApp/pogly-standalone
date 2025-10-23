import { useContext, useEffect, useState } from "react";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { DebugLogger } from "../../Utility/DebugLogger";
import { Config, EventContext } from "../../module_bindings";
import { SpacetimeContextType } from "../../Types/General/SpacetimeContextType";

export const useConfigEvents = (canvasInitialized: CanvasInitializedType) => {
  const spacetimeDB: SpacetimeContextType = useContext(SpacetimeContext);
  const [reload,setReload] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB.Identity || canvasInitialized.elementEventsInitialized) return;

    DebugLogger("Initializing Config Listener");

    spacetimeDB.Client.db.config.onUpdate((ctx: EventContext, oldConfig: Config, newConfig: Config) => {
      if(oldConfig !== newConfig) setReload(!reload);
    });
  }, [spacetimeDB.Identity, reload, setReload, canvasInitialized.elementEventsInitialized, spacetimeDB.Client]);

  return reload;
};
