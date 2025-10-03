import { useContext, useEffect, useState } from "react";
import { useAppSelector } from "../../Store/Features/store";
import Guests from "../../module_bindings/guests";
import { CursorComponent } from "../General/CursorComponent";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { LayoutContext } from "../../Contexts/LayoutContext";

export const CursorsContainer = () => {
  const { Identity } = useSpacetimeContext();
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
  }, [layoutContext.activeLayout, guests, Identity.address]);

  return (
    <div>
      {visibleCursors &&
        visibleCursors.map((guest: Guests) => {
          return <CursorComponent key={guest.identity.toHexString()} guest={guest} />;
        })}
    </div>
  );
};
