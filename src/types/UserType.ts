import { Address, Identity } from "@clockworklabs/spacetimedb-sdk";

export interface UserType {
  Address: Address;
  Identity: Identity;
  Token: string;
  Nickname: string;
  Connected: boolean;
}
