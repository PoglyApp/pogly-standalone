import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { ElementData, EventContext } from "@/module_bindings";
import { useContext, useEffect, useState } from "react";

type SetElementDataList = React.Dispatch<React.SetStateAction<ElementData[]>>;

export const useElementDataEvents = (setElementDataList: SetElementDataList) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;
    setInitialized(true);

    // INSERT
    spacetimeDB.Client.db.elementData.onInsert((ctx: EventContext, elementData: ElementData) => {
      if (!ctx.event) return;

      setElementDataList((prev) => [...prev, elementData]);
    });

    // UPDATE
    spacetimeDB.Client.db.elementData.onUpdate((ctx: EventContext, oldData: ElementData, newData: ElementData) => {
      if (!ctx.event) return;

      setElementDataList((prev) => prev.map((d) => (d.id === newData.id ? newData : d)));
    });

    // DELETE
    spacetimeDB.Client.db.elementData.onDelete((ctx: EventContext, elementData: ElementData) => {
      if (!ctx.event) return;

      setElementDataList((prev) => prev.filter((d) => d.id !== elementData.id));
    });
  }, [spacetimeDB, initialized]);
};
