import { useContext, useEffect, useRef, useState } from "react";
import Layouts from "../../module_bindings/layouts";
import { toast } from "react-toastify";
import { LayoutContext } from "../../Contexts/LayoutContext";
import { DebugLogger } from "../../Utility/DebugLogger";

export const useLayoutEvents = (setLayouts: Function) => {
  const layoutContext = useContext(LayoutContext);

  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);
  const activeLayout = useRef<Layouts>(layoutContext.activeLayout);

  useEffect(() => {
    DebugLogger("Updating layout refs");
    activeLayout.current = layoutContext.activeLayout;
  }, [layoutContext]);

  useEffect(() => {
    if (eventsInitialized) return;

    DebugLogger("Initializing layout events");

    Layouts.onInsert((newLayout) => {
      setLayouts((oldLayouts: any) => [...oldLayouts, newLayout]);
    });

    Layouts.onUpdate((oldLayout, newLayout) => {
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
    });

    Layouts.onDelete((layout) => {
      const menuItem = document.getElementById(layout.id + "_layout");
      menuItem?.remove();

      if (layout.id !== activeLayout.current.id) return;

      layoutContext.setActiveLayout(Layouts.filterByActive(true).next().value);
    });

    setEventsInitialized(true);
  }, [eventsInitialized, setLayouts, layoutContext]);
};
