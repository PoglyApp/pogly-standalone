import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { ElementData, EventContext } from "@/module_bindings";
import { useContext, useEffect, useState } from "react";

export const useElementDataEvents = (dataInitialized: Function) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;
    setInitialized(true);

    // INSERT
    spacetimeDB.Client.db.elementData.onInsert((ctx: EventContext, element: ElementData) => {
      if (!ctx.event) return;
      dataInitialized(false);
    });

    // UPDATE
    spacetimeDB.Client.db.elementData.onUpdate((ctx: EventContext, oldData: ElementData, newData: ElementData) => {
      if (!ctx.event) return;

      // FOLDER UPDATE
      if (oldData.folderId !== newData.folderId) {
        dataInitialized(false);
      }
    });

    // DELETE
    spacetimeDB.Client.db.elementData.onDelete((ctx: EventContext, element: ElementData) => {
      if (!ctx.event) return;
      dataInitialized(false);
    });
  }, [spacetimeDB, initialized]);
};
