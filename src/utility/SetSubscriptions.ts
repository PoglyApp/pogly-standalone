import { DbConnection, RemoteReducers, RemoteTables, SetReducerFlags } from "../module_bindings";
import { SubscriptionEventContextInterface } from "spacetimedb";

export const SetSubscriptions = (
  client: DbConnection,
  setStdbSubscriptions: Function,
  setStdbInitialized?: Function
) => {
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
      "SELECT * FROM Folders",
      "SELECT * FROM Layouts",
    ]);

  if (setStdbInitialized) setStdbInitialized(true);
};
