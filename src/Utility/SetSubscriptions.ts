import { DebugLogger } from "./DebugLogger";
import { DbConnection, RemoteReducers, RemoteTables, SetReducerFlags } from "../module_bindings";
import { SubscriptionEventContextInterface } from "@clockworklabs/spacetimedb-sdk";

export const SetSubscriptions = (
  client: DbConnection,
  setStdbSubscriptions: Function,
  setStdbInitialized?: Function
) => {
  DebugLogger("Subscribing to tables");

  client
    .subscriptionBuilder()
    .onApplied((ctx: SubscriptionEventContextInterface<RemoteTables, RemoteReducers, SetReducerFlags>) => {
      setStdbSubscriptions(true);
    })
    .subscribe([
      "SELECT * FROM Heartbeat",
      "SELECT * FROM Guests",
      "SELECT * FROM Elements",
      "SELECT * FROM ElementData",
      "SELECT * FROM Config",
      "SELECT * FROM Permissions",
      "SELECT * FROM Layouts",
    ]);

  if (setStdbInitialized) setStdbInitialized(true);
};
