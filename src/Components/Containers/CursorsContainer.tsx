import { useContext, useState } from "react";
import { useAppSelector } from "../../Store/Features/store";
import Guests from "../../module_bindings/guests";
import { CursorComponent } from "../General/CursorComponent";
import Config from "../../module_bindings/config";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { ConfigContext } from "../../Contexts/ConfigContext";

export const CursorsContainer = () => {
  const { Identity } = useSpacetimeContext();
  const config: Config = useContext(ConfigContext);

  const guests = useAppSelector((state: any) => state.guests.guests);

  return (
    <>
      {guests
        .filter(
          (guest: Guests) => guest.identity.toHexString() !== Identity.identity.toHexString() && guest.nickname !== ""
        )
        .map((guest: Guests) => {
          if (config.authentication && !guest.authenticated) return <></>;
          return <CursorComponent key={guest.nickname + "_cursor"} guest={guest} />;
        })}
    </>
  );
};
