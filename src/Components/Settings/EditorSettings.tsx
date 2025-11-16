import { useContext, useState } from "react";
import { Button } from "../NewUiComponents/Button";
import { TextInput } from "../NewUiComponents/TextInput";
import { DbConnection, Guests, Permissions } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { Table } from "../NewUiComponents/Table";
import { Select } from "../NewUiComponents/Select";
import styled, { css } from "styled-components";
import { PermissionSettings } from "./PermissionSettings";

enum PermissionTab {
  Editors,
  Permissions,
  Roles,
}

export const EditorSettings = () => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [tabSelected, setTabSelected] = useState<PermissionTab>(PermissionTab.Editors);

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
      if (guest.nickname.toLowerCase() === username.toLowerCase()) selectedGuest = guest;
    });

    if (!selectedGuest) return;

    var permissions: Permissions[] = Array.from((spacetimeDB.Client as DbConnection).db.permissions.iter());

    let userPerms: Number[] = [];
    permissions.forEach((perm: Permissions) => {
      if (selectedGuest!.identity.toHexString() === perm.identity.toHexString()) userPerms.push(perm.permissionType);
    });

    userPerms.push(parseInt(permission));

    spacetimeDB.Client.reducers.setIdentityPermission((selectedGuest as Guests).identity, userPerms);
  };

  if (!spacetimeDB.Client) return null;

  return (
    <div className="flex flex-col gap-1 overflow-hidden">
      <div className="flex gap-2 pb-4 border-b border-[#10121a]">
        <PermissionTabButton
          selected={tabSelected === PermissionTab.Editors}
          onClick={() => setTabSelected(PermissionTab.Editors)}
        >
          editors
        </PermissionTabButton>
        <PermissionTabButton
          selected={tabSelected === PermissionTab.Roles}
          onClick={() => setTabSelected(PermissionTab.Roles)}
        >
          roles
        </PermissionTabButton>
      </div>

      {tabSelected === PermissionTab.Editors && (
        <>
          <div>
            <p className="text-md">add editor</p>
            <div className="flex gap-2 max-lg:grid">
              <TextInput placeholder="username" inputClassName="min-w-[150px] h-[44px]" onChange={() => {}} />

              <Select className="w-full h-[44px] max-lg:w-full" onChange={() => {}}>
                <option value="twitch">twitch</option>
                <option value="kick">kick</option>
                <option value="youtube">youtube</option>
              </Select>

              <Select className="w-full h-[44px] max-lg:w-full" onChange={() => {}}>
                <option value="edtior">editor</option>
                <option value="admin">admin</option>
                <option value="moderator">moderator</option>
              </Select>

              <Button className="min-w-fit h-[44px]" onClick={() => {}}>
                add user
              </Button>
            </div>
          </div>

          <div>
            <p className="text-md">editors</p>
            <Table
              headers={["name", "platform", "permissions", "actions"]}
              rows={[["dynny_", "twitch", "owner", "..."]]}
            />
          </div>
        </>
      )}

      {tabSelected === PermissionTab.Roles && <PermissionSettings />}
    </div>
  );
};

const PermissionTabButton = styled.button<{ selected: boolean }>`
  cursor: pointer;

  width: 100%;
  text-align: left;

  border: solid 1px transparent;
  border-radius: 6px;

  font-size: 14px;
  padding: 6px 10px;

  background-color: ${(props) => props.selected && "#82a5ff4d"};
  border: ${(props) => props.selected && "solid 1px #82a5ff"};

  &:hover {
    ${(props) =>
      !props.selected &&
      css`
        background-color: #82a5ff1c;
        border: solid 1px #82a5ff78;
      `}
  }
`;
