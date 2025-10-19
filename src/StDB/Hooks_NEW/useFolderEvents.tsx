import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { EventContext, Folders } from "@/module_bindings";
import { useContext, useEffect, useState } from "react";

export const useFolderEvents = (dataInitialized: Function) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;
    setInitialized(true);

    // INSERT
    spacetimeDB.Client.db.folders.onInsert((ctx: EventContext, folder: Folders) => {
      if (!ctx.event) return;
      dataInitialized(false);
    });

    // UPDATE
    spacetimeDB.Client.db.folders.onUpdate((ctx: EventContext, oldFolder: Folders, newFolder: Folders) => {
      if (!ctx.event) return;

      // FOLDER UPDATE
      dataInitialized(false);
    });

    // DELETE
    spacetimeDB.Client.db.folders.onDelete((ctx: EventContext, folder: Folders) => {
      if (!ctx.event) return;
      dataInitialized(false);
    });
  }, [spacetimeDB, initialized]);
};
