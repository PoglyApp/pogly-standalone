import { DebugLogger } from "./DebugLogger";
import { Config, DbConnection, EventContext, Guests } from "../module_bindings";
import { ConnectionId } from "@clockworklabs/spacetimedb-sdk";

export const SetStdbConnected = (
  client: DbConnection,
  address: ConnectionId,
  fetchedConfig: Config,
  setStdbConnected: Function,
  setStdbAuthenticated: Function
) => {
  DebugLogger("Setting SpacetimeDB connected");
  // NO AUTHENTICATION
  const onInsert = (_ctx: EventContext, newGuest: Guests) => {
    if (newGuest.address.toHexString() !== address.toHexString()) return;

    setStdbConnected(true);
  }

  // AUTHENTICATION
  const onUpdate = (_ctx: EventContext, oldGuest: Guests, newGuest: Guests) => {
    if (newGuest.address.toHexString() !== address.toHexString()) return;
    if (oldGuest.authenticated === newGuest.authenticated) return;

    if (fetchedConfig.authentication && newGuest.authenticated) setStdbAuthenticated(true);
  };

  client.db.guests.onInsert(onInsert);
  client.db.guests.onUpdate(onUpdate);
};
