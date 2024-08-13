import { Identity, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";
import Guests from "../../module_bindings/guests";

export type SpacetimeContextType = {
  Client: SpacetimeDBClient;
  Identity: Guests;
  Elements: number[];
  ElementData: number[];
  Guests: Identity[];
};
