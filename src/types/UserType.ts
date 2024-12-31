import { DBConnection } from "@/module_bindings";
import { Address, Identity } from "@clockworklabs/spacetimedb-sdk";

export interface UserType {
  Address: Address;
  Identity: Identity;
  Token: string;
  Nickname: string;
  Client: DBConnection;
}
