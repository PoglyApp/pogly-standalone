import { Identity, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";
import Guests from "../../module_bindings/guests";
import { ConnectionConfigType } from "../ConfigTypes/ConnectionConfigType";

export type SpacetimeContextType = {
  Client: SpacetimeDBClient;
  Identity: Guests;
  Runtime: ConnectionConfigType | undefined;
  Elements: number[];
  ElementData: number[];
  Guests: Identity[];
};
