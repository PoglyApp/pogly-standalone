import { useState, useMemo, useEffect, useImperativeHandle, useContext } from "react";
import { TextInput } from "../NewUiComponents/TextInput";
import { Checkbox } from "../NewUiComponents/Checkbox";
import { PERMISSION_GROUPS, PermissionGroup } from "../../Types/General/PermissionGroups";
import { Editor } from "../../Types/General/Editor";
import { Permissions, PermissionSets } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";

interface IProps {
  editor: Editor | null;
  setEditor: Function;
  permissionSet: PermissionSets | null;
  setPermissionSet: Function;
  showSaveFooter: Function;
  settingsRef: any;
}

export const PermissionSettings = ({
  editor,
  setEditor,
  permissionSet,
  setPermissionSet,
  showSaveFooter,
  settingsRef,
}: IProps) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [selected, setSelected] = useState<Set<Number>>(new Set());

  const allPermissionIds = useMemo(() => PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id)), []);
  const isAllSelected = selected.size === allPermissionIds.length;

  const [roleName, setRoleName] = useState<string>(permissionSet ? permissionSet.name : "");

  useEffect(() => {
    if (permissionSet) {
      setSelected(new Set(permissionSet.permissions));
    }

    if (editor) {
      setSelected(new Set(editor.permissions.map((permission: Permissions) => permission.permissionType)));
    }
  }, []);

  const togglePermission = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleGroup = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    const shouldDeselect = groupIds.every((id) => selected.has(id));

    setSelected((prev) => {
      const next = new Set(prev);
      groupIds.forEach((id) => (shouldDeselect ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(isAllSelected ? new Set() : new Set(allPermissionIds));
  };

  const handleSave = () => {
    if (roleName.length === 0 || selected.size === 0) return;

    spacetimeDB.Client.reducers.addPermissionSet(roleName, Array.from(selected));
  };

  const handleDelete = () => {
    spacetimeDB.Client.reducers.deletePermissionSet(permissionSet?.id);
    handleCancel();
  };

  const handleCancel = () => {
    setSelected(new Set());
    setRoleName("");
    showSaveFooter(false);
    setEditor(null);
    setPermissionSet(null);
  };

  useImperativeHandle(settingsRef, () => ({
    save() {
      handleSave();
    },
    cancel() {
      handleCancel();
    },
    delete() {
      handleDelete();
    },
  }));

  return (
    <div className="flex flex-col h-full text-slate-100">
      <div className="border-b border-[#10121a] pt-3 pb-3">
        {permissionSet && (
          <div className="flex-1">
            <label className="text-xs tracking-wide text-gray-400 mb-1 block">role name</label>
            <TextInput
              placeholder="e.g. Moderator"
              value={roleName}
              inputClassName="min-w-[150px] h-[44px]"
              onChange={(event) => setRoleName(event.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className=" cursor-pointer rounded-[6px] bg-[#10121a] border border-[#10121a] px-2 py-1 text-[11px] uppercase tracking-wide hover:bg-[#17191f] transition-colors"
            >
              {isAllSelected ? "Clear all" : "Select all"}
            </button>
            <span className="text-slate-500">
              {selected.size} of {allPermissionIds.length} permissions selected
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden mt-3">
        <div className="min-w-full h-full border border-[#10121a]  overflow-auto">
          <div className="sticky top-0 z-10 grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_88px] border-b border-[#1e212b] text-[11px] uppercase tracking-wide text-gray-400 px-4 py-2 bg-[#10121a]">
            <div>Permission</div>
            <div>Description</div>
            <div className="text-center pr-3">Allow</div>
          </div>

          {PERMISSION_GROUPS.map((group) => {
            const groupIds = group.permissions.map((p) => p.id);
            const allInGroupSelected = groupIds.every((id) => selected.has(id));

            return (
              <div key={group.id} className="border-t border-[#1e212b]">
                <div className="flex items-center justify-between px-4 py-2 bg-[#17191f]">
                  <div className="flex items-center gap-3">
                    <Checkbox label={group.label} checked={allInGroupSelected} onChange={() => toggleGroup(group)} />
                    <span className="text-[11px] text-slate-500">{group.permissions.length} permissions</span>
                  </div>
                </div>

                {group.permissions.map((perm, idx) => {
                  const checked = selected.has(perm.id);
                  const isLast = idx === group.permissions.length - 1;

                  return (
                    <div
                      key={perm.id}
                      className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_88px] items-center px-4 py-2 text-sm ${
                        !isLast ? "border-b border-[#1e212b]" : ""
                      } hover:bg-[#17191f] transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox label={perm.label} checked={checked} onChange={() => togglePermission(perm.id)} />
                      </div>

                      <div className="text-xs text-gray-400">{perm.description}</div>

                      <div className="text-right pr-3">
                        <button
                          type="button"
                          onClick={() => togglePermission(perm.id)}
                          className={`inline-flex items-center justify-center rounded-[7px] px-3 py-1 text-[11px] uppercase border transition-colors ${
                            checked
                              ? "cursor-pointer border-[#82a5ff] bg-[#82a5ff4d] text-gray-200"
                              : "cursor-pointer border-[#1e212b] bg-[#10121a] text-gray-400 hover:bg-[#17191f]"
                          }`}
                        >
                          {checked ? "Allowed" : "Disabled"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
