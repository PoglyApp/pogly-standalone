import { useEffect } from "react";
import { DebugLogger } from "../Utility/DebugLogger";

export const useGetConnectionConfig = (setConnectionConfig: Function) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const isWidget: Boolean = window.location.href.includes("/widget");

  useEffect(() => {
    if(isWidget) return;
    DebugLogger("Getting connection config");
    const urlParams = new URLSearchParams(window.location.search);

    if (isOverlay || (urlParams.get("domain") && urlParams.get("module"))) {
      setConnectionConfig({
        token: "",
        domain: urlParams.get("domain") || "",
        module: urlParams.get("module") || "",
        authKey: urlParams.get("auth") || "",
        remember: false
      });
    } else {
      const stdbConnectToken = localStorage.getItem("twitchIdToken") || "";
      const stdbConnectDomain = localStorage.getItem("stdbConnectDomain") || "";
      const stdbConnectModule = localStorage.getItem("stdbConnectModule") || "";
      const stdbConnectModuleAuthKey = localStorage.getItem("stdbConnectModuleAuthKey") || "";

      if (stdbConnectDomain !== "" && stdbConnectModule !== "")
        setConnectionConfig({
          token: stdbConnectToken,
          domain: stdbConnectDomain,
          module: stdbConnectModule,
          authKey: stdbConnectModuleAuthKey,
          remember: true,
        });
    }
  }, [isOverlay, setConnectionConfig, isWidget]);
};
