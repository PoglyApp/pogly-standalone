import { Address, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";
import Guests from "../module_bindings/guests";
import Config from "../module_bindings/config";
import { DebugLogger } from "./DebugLogger";

export const SetStdbConnected = (
  client: SpacetimeDBClient,
  address: Address,
  fetchedConfig: Config,
  setStdbConnected: Function,
  setStdbAuthenticated: Function
) => {
  DebugLogger("Setting SpacetimeDB connected");
  // NO AUTHENTICATION
  Guests.onInsert((newGuest) => {
    if (newGuest.address.toHexString() !== address.toHexString()) return;

    setStdbConnected(true);
  });

  // AUTHENTICATION
  Guests.onUpdate((oldGuest, newGuest) => {
    if (newGuest.address.toHexString() !== address.toHexString()) return;
    if (oldGuest.authenticated === newGuest.authenticated) return;

    if (fetchedConfig.authentication && newGuest.authenticated) setStdbAuthenticated(true);
  });
};
