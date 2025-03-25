import { useEffect, useState } from "react";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { DebugLogger } from "../../Utility/DebugLogger";
import { Config, EventContext } from "../../module_bindings";

export const useConfigEvents = (canvasInitialized: CanvasInitializedType) => {
  const { Identity, Client } = useSpacetimeContext();
  const [reload,setReload] = useState<boolean>(false);

  useEffect(() => {
    if (!Identity || canvasInitialized.elementEventsInitialized) return;

    DebugLogger("Initializing Config Listener");

    Client.db.config.onUpdate((ctx: EventContext, oldConfig: Config, newConfig: Config) => {
      if(oldConfig !== newConfig) setReload(!reload);
    });
  }, [Identity, reload, setReload, canvasInitialized.elementEventsInitialized, Client]);

  return reload;
};
