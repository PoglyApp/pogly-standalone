import { useContext, useState } from "react";
import { useAppSelector } from "../../Store/Features/store";
import Guests from "../../module_bindings/guests";
import { CursorComponent } from "../General/CursorComponent";
import Config from "../../module_bindings/config";
import { IdentityContext } from "../../Contexts/IdentityContext";
import { ConfigContext } from "../../Contexts/ConfigContext";

export const CursorsContainer = () => {
  const identity = useContext(IdentityContext);
  const config: Config = useContext(ConfigContext);
  const guests = useAppSelector((state: any) => state.guests.guests);

  return (
    <>
      {guests
        .filter(
          (guest: Guests) => guest.identity.toHexString() !== identity.identity.toHexString() && guest.nickname !== ""
        )
        .map((guest: Guests) => {
          if (config.authentication && !guest.authenticated) return <></>;
          return <CursorComponent key={guest.nickname + "_cursor"} guest={guest} />;
        })}
    </>
  );
};
