import { useEffect, useState } from "react";
import Layouts from "../../module_bindings/layouts";

const useFetchLayours = () => {
  const [layouts, setLayouts] = useState<Layouts[]>();

  useEffect(() => {
    const fetchedLayouts = Layouts.all();

    setLayouts(fetchedLayouts);
  }, []);

  return layouts;
};

export default useFetchLayours;
