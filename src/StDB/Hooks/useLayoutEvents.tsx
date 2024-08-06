import { useEffect, useState } from "react";
import Layouts from "../../module_bindings/layouts";
import { toast } from "react-toastify";

export const useLayoutEvents = (setLayouts: Function) => {
  const [eventsInitialized, setEventsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (eventsInitialized) return;

    Layouts.onInsert((newLayout) => {
      setLayouts((oldLayouts: any) => [...oldLayouts, newLayout]);
    });

    Layouts.onUpdate((oldLayout, newLayout) => {
      if (oldLayout.active === false && newLayout.active === true) {
        const layoutIcon = document.getElementById(newLayout.id + "_layout_icon");
        layoutIcon!.style.display = "unset";

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
        layoutIcon!.style.display = "none";
      }
    });

    Layouts.onDelete((layout) => {
      const menuItem = document.getElementById(layout.id + "_layout");
      menuItem?.remove();
    });

    setEventsInitialized(true);
  }, [eventsInitialized, setLayouts]);
};
