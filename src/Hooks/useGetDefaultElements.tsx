import { useEffect } from "react";
import { DebugLogger } from "../Utility/DebugLogger";

export const useGetDefaultElements = async (setDefaultElements: Function) => {
  useEffect(() => {
    (async () => {
      DebugLogger("Fetching default elements from Github");

      const response = await fetch("https://raw.githubusercontent.com/PoglyApp/.github/main/beacons/elements");
      const responseText = await response.text();

      setDefaultElements(responseText);
    })();
  }, [setDefaultElements]);
};
