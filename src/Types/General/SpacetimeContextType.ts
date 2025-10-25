import { Identity } from "spacetimedb";
import { ConnectionConfigType } from "../ConfigTypes/ConnectionConfigType";
import { DbConnection, Guests } from "../../module_bindings";

export type SpacetimeContextType = {
  Client: DbConnection | undefined;
  Identity: Guests;
  Runtime: ConnectionConfigType | undefined;
  Elements: number[];
  ElementData: number[];
  Guests: Identity[];
  Disconnected: Boolean;
};
