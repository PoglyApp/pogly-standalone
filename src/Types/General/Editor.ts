import { Identity } from "spacetimedb";
import { StreamingPlatform, Permissions } from "../../module_bindings";

export type Editor = {
  identity: Identity;
  nickname: string;
  platform: StreamingPlatform;
  avatar: string;
  permissions: Permissions[];
};
