import { useContext, useEffect, useState } from "react";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { EventContext, Permissions } from "../../module_bindings";
import { Editor } from "../../Types/General/Editor";

type SetPermissionList = React.Dispatch<React.SetStateAction<Permissions[]>>;

export const usePermissionEvents = (setPermissions: SetPermissionList) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;
    setInitialized(true);

    spacetimeDB.Client.db.permissions.onInsert((ctx: EventContext, newPermission: Permissions) => {
      setPermissions((prev) => [...prev, newPermission]);
    });

    spacetimeDB.Client.db.permissions.onUpdate((ctx: EventContext, oldSet: Permissions, newPermission: Permissions) => {
      setPermissions((prev) =>
        prev.map((p) => (p.identity.toHexString() === newPermission.identity.toHexString() ? newPermission : p))
      );

      setPermissions((prev) =>
        prev.map((p) => (p.identity.toHexString() === newPermission.identity.toHexString() ? newPermission : p))
      );
    });

    spacetimeDB.Client.db.permissions.onDelete((ctx: EventContext, permission: Permissions) => {
      setPermissions((prev) => prev.filter((p) => p.identity.toHexString() !== permission.identity.toHexString()));
    });
  }, []);
};
