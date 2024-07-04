import { Identity } from "@clockworklabs/spacetimedb-sdk";
import Guests from "../../module_bindings/guests";

export type SpacetimeContextType = {
  Identity: Guests;
  Elements: number[];
  ElementData: number[];
  Guests: Identity[];
};
