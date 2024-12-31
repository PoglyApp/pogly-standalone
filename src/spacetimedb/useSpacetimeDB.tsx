import { DBConnection } from "@/module_bindings";
import { Address, DBConnectionImpl, Identity } from "@clockworklabs/spacetimedb-sdk";
import { useEffect, useState } from "react";

const useSpacetimeDB = (init: boolean, setInit: Function) => {

  const [address, setAddress] = useState<Address>();
  const [identity, setIdentity] = useState<Identity>();
  const [token, setToken] = useState<string>();
  const [nickname, setNickname] = useState<string>();
  const [client, setClient] = useState<DBConnection>();
  const [error, setError] = useState<boolean>(false);

  const STDB_ADDRESS = "ws://127.0.0.1:3000";
  const STDB_MODULE = "new_pogly";

  useEffect(() => {
    if (init) return;

    const client = DBConnection.builder().withUri(STDB_ADDRESS).withModuleName(STDB_MODULE).build();

    client.on("connect", (event: DBConnectionImpl) => {
      if (!event.identity || !event.token)
        return console.log("Error connecting to SpacetimeDB: Identity or Token missing.");

      client
        .subscriptionBuilder()
        .onApplied(() => {
          setInit(true);
        })
        .subscribe([
          "SELECT * FROM Heartbeat",
          "SELECT * FROM Guests",
          "SELECT * FROM Config",
          "SELECT * FROM Permissions",
        ]);

        setIdentity(event.identity);
        setAddress(event.clientAddress);
        setToken(event.token);
        setNickname("Guest_" + Date.now().toString());

      console.log(
        `Connected to SpacetimeDB! [${event.identity.toHexString()}] @ [${event.clientAddress.toHexString()}]`
      );
    });

    client.on("disconnect", () => {
      console.log("Disconnected from SpacetimeDB. Was this intentional?");
    });

    client.on("connectError", () => {
      setError(true);
      console.log(
        `Failed connecting to SpacetimeDB!\nPlease verify your module name\n\nAddress: ${STDB_ADDRESS}\nModule: ${STDB_MODULE}`
      );
    });

    setClient(client);
  }, []);

  return {Client: client, Address: address, Identity: identity, Token: token, Nickname: nickname, Error: error}
};

export default useSpacetimeDB;
