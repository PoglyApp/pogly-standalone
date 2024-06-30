export const ClearConnectionSettings = () => {
  localStorage.removeItem("stdbConnectModuleAuthKey");
  localStorage.removeItem("stdbConnectDomain");
  localStorage.removeItem("stdbConnectModule");
};
