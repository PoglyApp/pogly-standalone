import { SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";
import { DebugLogger } from "./DebugLogger";

export const SetSubscriptions = (client: SpacetimeDBClient, setStdbSubscriptions: Function) => {
  DebugLogger("Subscribing to tables");
  client.subscribe([
    "SELECT * FROM Heartbeat",
    "SELECT * FROM Guests",
    "SELECT * FROM Elements",
    "SELECT * FROM ElementData",
    "SELECT * FROM Config",
    "SELECT * FROM Permissions",
    "SELECT * FROM Layouts",
  ]);
  setStdbSubscriptions(true);
  return true;
};
