export type Permission = {
  id: number;
  label: string;
  description?: string;
};

export type PermissionGroup = {
  id: string;
  label: string;
  permissions: Permission[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
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
