import { DebugLogger } from "./DebugLogger";
import { Config, DbConnection, EventContext, Guests } from "../module_bindings";

export const SetStdbConnected = (
  client: DbConnection,
  fetchedConfig: Config,
  setStdbConnected: Function,
  setStdbAuthenticated: Function
) => {
  DebugLogger("Setting SpacetimeDB connected");
  // NO AUTHENTICATION
  client.db.guests.onInsert((_ctx: EventContext, newGuest: Guests) => {
    if (newGuest.address.toHexString() !== client.connectionId.toHexString()) return;

    setStdbConnected(true);
  });

  // AUTHENTICATION
  client.db.guests.onUpdate((_ctx: EventContext, oldGuest: Guests, newGuest: Guests) => {
    if (newGuest.address.toHexString() !== client.connectionId.toHexString()) return;
    if (oldGuest.authenticated === newGuest.authenticated) return;

    if (fetchedConfig.authentication && newGuest.authenticated) setStdbAuthenticated(true);
  });
};
