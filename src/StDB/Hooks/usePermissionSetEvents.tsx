import { useContext, useEffect, useState } from "react";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { EventContext, PermissionSets } from "../../module_bindings";

type SetPermissionSetsList = React.Dispatch<React.SetStateAction<PermissionSets[]>>;

export const usePermissionSetEvents = (setPermissionSets: SetPermissionSetsList) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;
    setInitialized(true);

    spacetimeDB.Client.db.permissionSets.onInsert((ctx: EventContext, newSet: PermissionSets) => {
      setPermissionSets((prev) => [...prev, newSet]);
    });

    spacetimeDB.Client.db.permissionSets.onUpdate(
      (ctx: EventContext, oldSet: PermissionSets, newSet: PermissionSets) => {
        setPermissionSets((prev) => prev.map((s) => (s.id === newSet.id ? newSet : s)));
      }
    );

    spacetimeDB.Client.db.permissionSets.onDelete((ctx: EventContext, set: PermissionSets) => {
      setPermissionSets((prev) => prev.filter((s) => s.id !== set.id));
    });
  }, []);
};
