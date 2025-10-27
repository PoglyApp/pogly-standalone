import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LayoutContext } from "../../Contexts/LayoutContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { Layouts, EventContext } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";

export const useLayoutEvents = (setLayouts: Function) => {
  const { activeLayout, setActiveLayout } = useContext(LayoutContext);
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);
  const theActiveLayout = useRef<Layouts>(activeLayout);

  useEffect(() => {
    DebugLogger("Updating layout refs");
    theActiveLayout.current = activeLayout;
  }, [theActiveLayout]);

  useEffect(() => {
    if (eventsInitialized) return;

    DebugLogger("Initializing layout events");

    spacetimeDB.Client.db.layouts.onInsert((ctx: EventContext, newLayout: Layouts) => {
      setLayouts((oldLayouts: any) => [...oldLayouts, newLayout]);
    });

    spacetimeDB.Client.db.layouts.onUpdate((ctx: EventContext, oldLayout: Layouts, newLayout: Layouts) => {
      // ACTIVITY CHANGE
      if (oldLayout.active === false && newLayout.active === true) {
        const layoutIcon = document.getElementById(newLayout.id + "_layout_icon");
        if (layoutIcon) layoutIcon.style.display = "unset";

        toast.success(`${newLayout.name} has been made active.`, {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }

      if (oldLayout.active === true && newLayout.active === false) {
        const layoutIcon = document.getElementById(newLayout.id + "_layout_icon");
        if (layoutIcon) layoutIcon.style.display = "none";
      }

      if (oldLayout.name !== newLayout.name) {
        const layoutButton = document.getElementById(newLayout.id + "_layout_button");
        if (layoutButton) layoutButton.innerText = newLayout.name;
      }
    });

    spacetimeDB.Client.db.layouts.onDelete((ctx: EventContext, layout: Layouts) => {
      const menuItem = document.getElementById(layout.id + "_layout");
      menuItem?.remove();

      if (layout.id !== activeLayout.current.id) return;

      setActiveLayout((Array.from(spacetimeDB.Client.db.layouts.iter()) as Layouts[]).find((l: Layouts) => l.active === true));
    });

    setEventsInitialized(true);
  }, [eventsInitialized, setLayouts, activeLayout, setActiveLayout, spacetimeDB.Client]);
};
