import { DebugLogger } from "./DebugLogger";

export const ClearConnectionSettings = () => {
  DebugLogger("Clearing connection settings");

  localStorage.removeItem("stdbConnectModuleAuthKey");
  localStorage.removeItem("stdbConnectDomain");
  localStorage.removeItem("stdbConnectModule");
};
