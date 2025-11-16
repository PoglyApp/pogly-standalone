import { RefreshCcw } from "lucide-react";
import { useContext, useState } from "react";
import { Button } from "../NewUiComponents/Button";
import { Checkbox } from "../NewUiComponents/Checkbox";
import { TextInput } from "../NewUiComponents/TextInput";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { DbConnection, Guests, Permissions } from "../../module_bindings";

interface IProps {
  spacetimeDB: any;
}

export const EditorSettings = ({ spacetimeDB }: IProps) => {
  const [username, setUsername] = useState<string>("");
  const [permission, setPermission] = useState<string>("");

  const onUsernameUpdate = (e: any) => {
    setUsername(e.target.value);
  };

  const onPermissionUpdate = (e: any) => {
    setPermission(e.target.value);
  };

  const addPermission = () => {
    var guests: Guests[] = Array.from(spacetimeDB.Client.db.guests.iter());
    let selectedGuest;
    guests.forEach((guest: Guests) => {
      if(guest.nickname.toLowerCase() === username.toLowerCase()) selectedGuest = guest;
    });

    if (!selectedGuest) return;

    var permissions: Permissions[] = Array.from((spacetimeDB.Client as DbConnection).db.permissions.iter());

    let userPerms: Number[] = [];
    permissions.forEach((perm: Permissions) => {
      if(selectedGuest!.identity.toHexString() === perm.identity.toHexString()) userPerms.push(perm.permissionType);
    });

    userPerms.push(parseInt(permission));

    spacetimeDB.Client.reducers.setIdentityPermission((selectedGuest as Guests).identity, userPerms);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 max-md:grid">
        <TextInput placeholder="username" inputClassName="h-[44px] w-[200px]!" onChange={(e) => onUsernameUpdate(e)} value={username} />
        <TextInput placeholder="permission" inputClassName="h-[44px] w-[200px]!" onChange={(e) => onPermissionUpdate(e)} value={permission} />
      </div>
        <Button className="flex-1" onClick={() => addPermission()}>
          add permission
        </Button>
    </div>
  );
};
