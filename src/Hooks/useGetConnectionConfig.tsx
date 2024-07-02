import { useEffect } from "react";

export const useGetConnectionConfig = (setConnectionConfig: Function) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (isOverlay || (urlParams.get("domain") && urlParams.get("module"))) {
      setConnectionConfig({
        domain: urlParams.get("domain") || "",
        module: urlParams.get("module") || "",
        authKey: urlParams.get("auth") || "",
      });
    } else {
      const stdbConnectDomain = localStorage.getItem("stdbConnectDomain") || "";
      const stdbConnectModule = localStorage.getItem("stdbConnectModule") || "";
      const stdbConnectModuleAuthKey = localStorage.getItem("stdbConnectModuleAuthKey") || "";

      if (stdbConnectDomain !== "" && stdbConnectModule !== "")
        setConnectionConfig({
          domain: stdbConnectDomain,
          module: stdbConnectModule,
          authKey: stdbConnectModuleAuthKey,
          remember: true,
        });
    }
  }, [isOverlay, setConnectionConfig]);
};
