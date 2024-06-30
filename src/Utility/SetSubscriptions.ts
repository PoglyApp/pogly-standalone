import { SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export const SetSubscriptions = (client: SpacetimeDBClient) => {
    client.subscribe([
        "SELECT * FROM Heartbeat",
        "SELECT * FROM Guests",
        "SELECT * FROM Elements",
        "SELECT * FROM ElementData",
        "SELECT * FROM Config",
        "SELECT * FROM Permissions",
      ]);
      return true;
}