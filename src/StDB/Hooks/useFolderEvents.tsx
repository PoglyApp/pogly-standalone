import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { EventContext, Folders } from "@/module_bindings";
import { useContext, useEffect, useState } from "react";

type SetFoldersList = React.Dispatch<React.SetStateAction<Folders[]>>;

export const useFolderEvents = (setFoldersList: SetFoldersList) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;
    setInitialized(true);

    // INSERT
    spacetimeDB.Client.db.folders.onInsert((ctx: EventContext, folder: Folders) => {
      if (!ctx.event) return;

      setFoldersList((prev) => [...prev, folder]);
    });

    // UPDATE
    spacetimeDB.Client.db.folders.onUpdate((ctx: EventContext, oldFolder: Folders, newFolder: Folders) => {
      if (!ctx.event) return;

      setFoldersList((prev) => prev.map((f) => (f.id === newFolder.id ? newFolder : f)));
    });

    // DELETE
    spacetimeDB.Client.db.folders.onDelete((ctx: EventContext, folder: Folders) => {
      if (!ctx.event) return;

      setFoldersList((prev) => prev.filter((f) => f.id !== folder.id));
    });
  }, [spacetimeDB, initialized]);
};
