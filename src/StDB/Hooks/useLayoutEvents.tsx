import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LayoutContext } from "../../Contexts/LayoutContext";
import { DebugLogger } from "../../Utility/DebugLogger";
import { Layouts, EventContext } from "../../module_bindings";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";

export const useLayoutEvents = (setLayouts: Function) => {
  const layoutContext = useContext(LayoutContext);
  const { Client } = useSpacetimeContext();

  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);
  const activeLayout = useRef<Layouts>(layoutContext.activeLayout);

  useEffect(() => {
    DebugLogger("Updating layout refs");
    activeLayout.current = layoutContext.activeLayout;
  }, [layoutContext]);

  useEffect(() => {
    if (eventsInitialized) return;

    DebugLogger("Initializing layout events");

    Client.db.layouts.onInsert((ctx: EventContext, newLayout: Layouts) => {
      setLayouts((oldLayouts: any) => [...oldLayouts, newLayout]);
    });

    Client.db.layouts.onUpdate((ctx: EventContext, oldLayout: Layouts, newLayout: Layouts) => {
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

    Client.db.layouts.onDelete((ctx: EventContext, layout: Layouts) => {
      const menuItem = document.getElementById(layout.id + "_layout");
      menuItem?.remove();

      if (layout.id !== activeLayout.current.id) return;

      layoutContext.setActiveLayout(Array.from(Client.db.layouts.iter()).find((l: Layouts) => l.active === true));
    });

    setEventsInitialized(true);
  }, [eventsInitialized, setLayouts, layoutContext, Client]);
};
