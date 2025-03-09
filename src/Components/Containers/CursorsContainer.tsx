import { useContext, useEffect, useState } from "react";
import { useAppSelector } from "../../Store/Features/store";
import { CursorComponent } from "../General/CursorComponent";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { LayoutContext } from "../../Contexts/LayoutContext";
import { Config, Guests } from "../../module_bindings";

export const CursorsContainer = () => {
  const { Identity } = useSpacetimeContext();
  const config: Config = useContext(ConfigContext);
  const layoutContext = useContext(LayoutContext);

  const guests = useAppSelector((state: any) => state.guests.guests);

  return (
    <>
      {guests
        .filter(
          (guest: Guests) =>
            guest.address.toHexString() !== Identity.address.toHexString() &&
            guest.nickname !== "" &&
            layoutContext.activeLayout.id === guest.selectedLayoutId
        )
        .map((guest: Guests) => {
          if (config.authentication && !guest.authenticated) return <></>;
          return <CursorComponent key={guest.nickname + "_cursor"} guest={guest} />;
        })}
    </>
  );
};
