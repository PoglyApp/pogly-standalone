import { useEffect, useState } from "react";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { CanvasInitializedType } from "../../Types/General/CanvasInitializedType";
import { DebugLogger } from "../../Utility/DebugLogger";
import Config from "../../module_bindings/config";

export const useConfigEvents = (canvasInitialized: CanvasInitializedType) => {
  const { Identity } = useSpacetimeContext();
  const [reload,setReload] = useState<boolean>(false);

  useEffect(() => {
    if (!Identity || canvasInitialized.elementEventsInitialized) return;

    DebugLogger("Initializing Config Listener");

    Config.onUpdate((oldConfig, newConfig, reducerEvent) => {
      if(oldConfig !== newConfig) setReload(!reload);
    });
  }, [Identity, reload, setReload, canvasInitialized.elementEventsInitialized]);

  return reload;
};
