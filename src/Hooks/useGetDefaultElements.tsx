import { useEffect } from "react";

export const useGetDefaultElements = async (setDefaultElements: Function) => {
  useEffect(() => {
    (async () => {
      const response = await fetch("https://raw.githubusercontent.com/PoglyApp/.github/main/beacons/elements");
      const responseText = await response.text();

      setDefaultElements(responseText);
    })();
  }, [setDefaultElements]);
};
