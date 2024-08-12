import { useEffect, useState } from "react";
import Layouts from "../../module_bindings/layouts";

const useFetchLayouts = (setLayouts: Function) => {
  useEffect(() => {
    const fetchedLayouts = Layouts.all();

    setLayouts(
      fetchedLayouts.sort((a: any, b: any) => {
        return a.id - b.id;
      })
    );
  }, [setLayouts]);
};

export default useFetchLayouts;
