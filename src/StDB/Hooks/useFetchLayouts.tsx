import { useEffect, useState } from "react";
import Layouts from "../../module_bindings/layouts";

const useFetchLayours = (setLayouts: Function) => {
  useEffect(() => {
    const fetchedLayouts = Layouts.all();

    setLayouts(fetchedLayouts);
  }, []);
};

export default useFetchLayours;
