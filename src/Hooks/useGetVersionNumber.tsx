import { useEffect } from "react";

export const useGetVersionNumber = async (setVersionNumber: Function) => {
  useEffect(() => {
    (async () => {
      const response = await fetch("https://raw.githubusercontent.com/PoglyApp/.github/main/beacons/version");
      const versionText = await response.text();

      setVersionNumber(versionText);
    })();
  }, [setVersionNumber]);
};
