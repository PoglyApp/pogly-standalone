import { createContext, useContext } from "react";

export const SpacetimeContext = createContext<any>(undefined);

export const useSpacetimeContext = () => {
  const identity = useContext(SpacetimeContext);

  if (!identity || !identity.Identity) throw new Error("Somehow missing Spacetime identity.");

  return identity;
};
