import { useEffect, useState } from "react";
import { DebugLogger } from "../../Utility/DebugLogger";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";

const useFetchLayouts = (setLayouts: Function) => {
  const { Client } = useSpacetimeContext();

  useEffect(() => {
    DebugLogger("Fetching layouts");
    const fetchedLayouts = Array.from(Client.db.layouts.iter());

    setLayouts(
      fetchedLayouts.sort((a: any, b: any) => {
        return a.id - b.id;
      })
    );
  }, [setLayouts]);
};

export default useFetchLayouts;
