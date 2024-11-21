import { DBConnection } from "@/module_bindings";
import { Address, DBConnectionImpl, Identity } from "@clockworklabs/spacetimedb-sdk";
import { useEffect, useState } from "react";

const useSpacetimeDB = () => {
  const [identity, setIdentity] = useState<Identity>();
  const [address, setAddress] = useState<Address>();

  useEffect(() => {
    const client = DBConnection.builder().withUri("https://testnet.spacetimedb.com").withModuleName("").build();

    client.on("connect", (event: DBConnectionImpl) => {
      console.log(event);
    });
  }, []);
};

export default useSpacetimeDB;
