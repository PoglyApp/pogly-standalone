import React, { useState, useMemo } from "react";
import { TextInput } from "../NewUiComponents/TextInput";
import { Checkbox } from "../NewUiComponents/Checkbox";

type Permission = {
  id: number;
  label: string;
  description?: string;
};

type PermissionGroup = {
  id: string;
  label: string;
  permissions: Permission[];
};

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "general",
    label: "general",
    permissions: [
      {
        id: 1,
        label: "connect",
        description: "lets user connect to the module.",
      },
    ],
  },
  {
    id: "elements",
    label: "element handling",
    permissions: [
      {
        id: 9,
        label: "spawn elements",
        description: "allows user to spawn new elements.",
      },
      {
        id: 10,
        label: "interact with elements",
        description: "allows user to interact with existing elements.",
      },
      {
        id: 11,
        label: "delete elements",
        description: "allows user to delete elements.",
      },
    ],
  },
  {
    id: "folders",
    label: "element folders",
    permissions: [
      {
        id: 12,
        label: "add new folders",
        description: "allows user add new element data folders.",
      },
      {
        id: 13,
        label: "update folders",
        description: "allows user to update existing folders.",
      },
      {
        id: 14,
        label: "delete folders",
        description: "allows user to delete folders.",
      },
    ],
  },
  {
    id: "layouts",
    label: "layouts",
    permissions: [
      {
        id: 16,
        label: "add layouts",
        description: "allows user to add new layouts.",
      },
      {
        id: 17,
        label: "update layouts",
        description: "allows user to update existing layouts.",
      },
      {
        id: 18,
        label: "change active layout",
        description: "allows user to change active layouts.",
      },
      {
        id: 19,
        label: "delete layouts",
        description: "allows user to delete layouts.",
      },
    ],
  },
  {
    id: "admin",
    label: "admin",
    permissions: [
      {
        id: 15,
        label: "kick users",
        description: "allows user to kick other users.",
      },
      {
        id: 21,
        label: "modify permissions",
        description: "allows user to modify other user's permissions.",
      },
      {
        id: 22,
        label: "add/remove editors",
        description: "allows user to add or remove editors.",
      },
      {
        id: 20,
        label: "issue overlay commands",
        description: "allows user to trigger overlay commands.",
      },
    ],
  },
];

export const PermissionSettings = () => {
  const [selected, setSelected] = useState<Set<Number>>(new Set());

  const allPermissionIds = useMemo(() => PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.id)), []);
  const isAllSelected = selected.size === allPermissionIds.length;

  const togglePermission = (id: Number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    const allInGroupSelected = groupIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allInGroupSelected) {
        groupIds.forEach((id) => next.delete(id));
      } else {
        groupIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allPermissionIds));
    }
  };

  return (
    <div className="flex flex-col h-full text-slate-100">
      <div className="border-b border-[#10121a] pt-3 pb-3">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs tracking-wide text-gray-400 mb-1 block">role name</label>
            <TextInput placeholder="e.g. Moderator" inputClassName="min-w-[150px] h-[44px]" onChange={() => {}} />
          </div>
        </div>

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
