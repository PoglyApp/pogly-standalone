import { useContext } from "react";
import { useAppSelector } from "../../Store/Features/store";
import { CursorComponent } from "../General/CursorComponent";
import { LayoutContext } from "../../Contexts/LayoutContext";
import { Config, Guests } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";

export const CursorsContainer = () => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const { activeLayout } = useContext(LayoutContext);

  const guests = useAppSelector((state: any) => state.guests.guests);
  const config: Config = spacetimeDB.Client.db.config.version.find(0);

  return (
    <>
      {guests
        .filter(
          (guest: Guests) =>
            guest.address.toHexString() !== spacetimeDB.Identity.address.toHexString() &&
            guest.nickname !== "" &&
            activeLayout.id === guest.selectedLayoutId
        )
        .map((guest: Guests) => {
          if (config.authentication && !guest.authenticated) return <></>;
          return <CursorComponent key={guest.nickname + "_cursor"} guest={guest} />;
        })}
    </>
  );
};
