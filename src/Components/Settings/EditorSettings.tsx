import { forwardRef, useContext, useEffect, useImperativeHandle, useState } from "react";
import { Button } from "../NewUiComponents/Button";
import { TextInput } from "../NewUiComponents/TextInput";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { Table } from "../NewUiComponents/Table";
import { Select } from "../NewUiComponents/Select";
import styled, { css } from "styled-components";
import { Editor } from "../../Types/General/Editor";
import { getAllEditors } from "../../StDB/SpacetimeDBUtils";
import { TableRow } from "@mui/material";
import { TableCell } from "../NewUiComponents/TableCell";
import { PermissionSets } from "../../module_bindings";
import { PermissionSettings } from "./PermissionSettings";

enum PermissionTab {
  Editors,
  Permissions,
  Roles,
}

export type EditorSettingsRef = {
  save: () => void;
  cancel: () => void;
  delete: () => void;
};

interface IProps {
  showSaveFooter: Function;
}

export const EditorSettings = forwardRef<EditorSettingsRef, IProps>(({ showSaveFooter }, ref) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [tabSelected, setTabSelected] = useState<PermissionTab>(PermissionTab.Editors);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [roles, setRoles] = useState<PermissionSets[]>([]);

  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [selectedRole, setSelectedRole] = useState<PermissionSets | null>(null);

  useEffect(() => {
    if (!spacetimeDB) return;

    const editorCache: Editor[] = getAllEditors(spacetimeDB.Client);
    setEditors(editorCache);

    const roleCache: PermissionSets[] = spacetimeDB.Client.db.permissionSets.iter() as PermissionSets[];
    setRoles(roleCache);
  }, []);

  const createEmptyRole = () => {
    const emptyRole: PermissionSets = {} as PermissionSets;
    setSelectedRole(emptyRole);
    showSaveFooter(true);
  };

  if (!spacetimeDB.Client) return null;

  return (
    <div className="flex flex-col gap-1 overflow-hidden">
      {!(selectedEditor || selectedRole) && (
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
      )}

      {tabSelected === PermissionTab.Editors && !(selectedEditor || selectedRole) && (
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
                {roles.map((role: PermissionSets) => {
                  return (
                    <option key={`${role.name}_user_row`} value={role.name}>
                      {role.name}
                    </option>
                  );
                })}
              </Select>

              <Button className="min-w-fit h-[44px]" onClick={() => {}}>
                add user
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-md">editors</p>
            <Table headers={["name", "platform", "permissions", "actions"]}>
              {editors.map((editor: Editor) => {
                return (
                  <TableRow key={`${editor.nickname}_row`}>
                    <TableCell>{editor.nickname}</TableCell>
                    <TableCell>{editor.platform}</TableCell>
                    <TableCell>{editor.permissions.length}</TableCell>
                    <TableCell>....</TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>
        </>
      )}

      {tabSelected === PermissionTab.Roles && !(selectedEditor || selectedRole) && (
        <div className="mt-2">
          <Button className="w-full h-[44px] mb-3" onClick={createEmptyRole}>
            create new role
          </Button>

          <Table headers={["name", "permissions", "actions"]} alignLastLeft={true}>
            {roles.map((role: PermissionSets) => {
              return (
                <TableRow key={`${role.name}_row`}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.permissions.length}</TableCell>
                  <TableCell className=" flex justify-end">
                    <Button
                      className="min-w-fit m-0 py-1!"
                      onClick={() => {
                        setSelectedRole(role);
                        showSaveFooter(true);
                      }}
                    >
                      edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </div>
      )}

      {(selectedEditor || selectedRole) && (
        <PermissionSettings
          editor={selectedEditor}
          permissionSet={selectedRole}
          setEditor={setSelectedEditor}
          setPermissionSet={setSelectedRole}
          showSaveFooter={showSaveFooter}
          settingsRef={ref}
        />
      )}
    </div>
  );
});

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
