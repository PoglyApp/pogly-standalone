import { useEffect, useState } from "react";
import Layouts from "../../module_bindings/layouts";
import { DebugLogger } from "../../Utility/DebugLogger";

const useFetchLayouts = (setLayouts: Function) => {
  useEffect(() => {
    DebugLogger("Fetching layouts");
    const fetchedLayouts = Layouts.all();

    setLayouts(
      fetchedLayouts.sort((a: any, b: any) => {
        return a.id - b.id;
      })
    );
  }, [setLayouts]);
};

export default useFetchLayouts;
