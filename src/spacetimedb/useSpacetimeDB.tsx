import { DBConnection } from "@/module_bindings";
import { UserType } from "@/types/UserType.ts";
import { Address, DBConnectionImpl, Identity } from "@clockworklabs/spacetimedb-sdk";
import { useEffect, useState } from "react";

const useSpacetimeDB = (user: UserType | undefined, setUser: Function) => {
  const [identity, setIdentity] = useState<Identity>();
  const [address, setAddress] = useState<Address>();

  const STDB_ADDRESS = "ws://127.0.0.1:3000";
  const STDB_MODULE = "new_pogly";

  useEffect(() => {
    if (user) return;

    const client = DBConnection.builder().withUri(STDB_ADDRESS).withModuleName(STDB_MODULE).build();

    client.on("connect", (event: DBConnectionImpl) => {
      if (!event.identity || !event.token)
        return console.log("Error connecting to SpacetimeDB: Identity or Token missing.");

      client
        .subscriptionBuilder()
        .subscribe([
          "SELECT * FROM Heartbeat",
          "SELECT * FROM Guests",
          "SELECT * FROM Config",
          "SELECT * FROM Permissions",
        ]);

      const newUser: UserType = {
        Address: event.clientAddress,
        Identity: event.identity!,
        Token: event.token!,
        // TODO: Add logic to check if nickname is saved to local storage, if it is, use that instead.
        Nickname: "Guest_" + Date.now().toString(),
        Connected: true,
      };

      setUser(newUser);

      console.log(
        `Connected to SpacetimeDB! [${event.identity?.toHexString()}] @ [${event.clientAddress.toHexString()}]`
      );
    });

    client.on("disconnect", () => {
      console.log("Disconnected from SpacetimeDB. Was this intentional?");
    });

    client.on("connectError", () => {
      console.log(
        `Failed connecting to SpacetimeDB!\nPlease verify your module name\n\nAddress: ${STDB_ADDRESS}\nModule: ${STDB_MODULE}`
      );
    });
  }, []);
};

export default useSpacetimeDB;
