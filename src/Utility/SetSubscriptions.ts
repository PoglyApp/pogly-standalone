import { DebugLogger } from "./DebugLogger";
import { DbConnection } from "../module_bindings";

export const SetSubscriptions = (client: DbConnection, setStdbInitialized: Function, setStdbSubscriptions: Function) => {
  DebugLogger("Subscribing to tables");
  client.subscriptionBuilder()
    .onApplied(() => {
      setStdbInitialized(true);
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
  return true;
};
