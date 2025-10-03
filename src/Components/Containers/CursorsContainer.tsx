import { useContext, useEffect, useState } from "react";
import { useAppSelector } from "../../Store/Features/store";
import Guests from "../../module_bindings/guests";
import { CursorComponent } from "../General/CursorComponent";
import Config from "../../module_bindings/config";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { LayoutContext } from "../../Contexts/LayoutContext";

export const CursorsContainer = () => {
  const { Identity } = useSpacetimeContext();
  const config: Config = useContext(ConfigContext);
  const layoutContext = useContext(LayoutContext);

  const [visibleCursors, setVisibleCursors] = useState<Guests[]>([]);

  const guests = useAppSelector((state: any) => state.guests.guests);

  useEffect(() => {
    setVisibleCursors(() => {
      return guests.filter(
        (guest: Guests) =>
          guest.address.toHexString() !== Identity.address.toHexString() &&
          guest.nickname !== "" &&
          layoutContext.activeLayout.id === guest.selectedLayoutId
      );
    });
  }, [layoutContext.activeLayout, guests]);

  return (
    <>
      {visibleCursors &&
        visibleCursors.map((guest: Guests) => {
          return <CursorComponent key={guest.nickname + "_cursor"} guest={guest} />;
        })}
    </>
  );
};
