import { useContext, useEffect, useState } from "react";
import { DebugLogger } from "../../Utility/DebugLogger";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";

const useFetchLayouts = (setLayouts: Function) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  useEffect(() => {
    DebugLogger("Fetching layouts");
    const fetchedLayouts = Array.from(spacetimeDB.Client.db.layouts.iter());

    setLayouts(
      fetchedLayouts.sort((a: any, b: any) => {
        return a.id - b.id;
      })
    );
  }, [setLayouts, spacetimeDB.Client]);
};

export default useFetchLayouts;
