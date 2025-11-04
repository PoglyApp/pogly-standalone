import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { EventContext, Layouts } from "@/module_bindings";
import { useContext, useEffect, useState } from "react";

type SetLayoutsList = React.Dispatch<React.SetStateAction<Layouts[]>>;

export const useLayoutsEvents = (setLayoutsList: SetLayoutsList) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;
    setInitialized(true);

    // INSERT
    spacetimeDB.Client.db.layouts.onInsert((ctx: EventContext, layout: Layouts) => {
      if (!ctx.event) return;

      setLayoutsList((prev) => [...prev, layout]);
    });

    // UPDATE
    spacetimeDB.Client.db.layouts.onUpdate((ctx: EventContext, oldLayout: Layouts, newLayout: Layouts) => {
      if (!ctx.event) return;

      setLayoutsList((prev) => prev.map((l) => (l.id === newLayout.id ? newLayout : l)));
    });

    // DELETE
    spacetimeDB.Client.db.layouts.onDelete((ctx: EventContext, layout: Layouts) => {
      if (!ctx.event) return;

      setLayoutsList((prev) => prev.filter((l) => l.id !== layout.id));
    });
  }, [spacetimeDB, initialized]);
};
