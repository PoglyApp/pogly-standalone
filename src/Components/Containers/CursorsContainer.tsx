import { useContext } from "react";
import { useAppSelector } from "../../Store/Features/store";
import { CursorComponent } from "../General/CursorComponent";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { LayoutContext } from "../../Contexts/LayoutContext";
import { Guests } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";

export const CursorsContainer = () => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const { activeLayout } = useContext(LayoutContext);

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
    <>
      {guests
        .filter(
          (guest: Guests) =>
            guest.address.toHexString() !== spacetimeDB.Identity.address.toHexString() &&
            guest.nickname !== "" &&
            activeLayout.id === guest.selectedLayoutId
        )
        .map((guest: Guests) => {
          if (spacetimeDB.Config.authentication && !guest.authenticated) return <></>;
          return <CursorComponent key={guest.nickname + "_cursor"} guest={guest} />;
        })}
    </div>
  );
};
