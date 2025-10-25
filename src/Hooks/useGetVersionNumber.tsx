import { useEffect } from "react";
import { DebugLogger } from "../Utility/DebugLogger";

export const useGetVersionNumber = async (setVersionNumber: Function) => {
  useEffect(() => {
    (async () => {
      DebugLogger("Fetching version number");

      const response = await fetch("https://raw.githubusercontent.com/PoglyApp/.github/main/beacons/version");
      const versionText = await response.text();

      setVersionNumber(versionText);
    })();
  }, [setVersionNumber]);
};
