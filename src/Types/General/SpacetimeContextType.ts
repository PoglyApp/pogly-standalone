import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { ConnectionConfigType } from "../ConfigTypes/ConnectionConfigType";
import { DbConnection, Guests } from "../../module_bindings";

export type SpacetimeContextType = {
  Client: DbConnection;
  Identity: Guests;
  Runtime: ConnectionConfigType | undefined;
  Elements: number[];
  ElementData: number[];
  Guests: Identity[];
};
