import { createContext, useContext } from "react";
import { SpacetimeContextType } from "../Types/General/SpacetimeContextType";

export const SpacetimeContext = createContext<SpacetimeContextType | undefined>(undefined);

export const useSpacetimeContext = () => {  
  const identity = useContext(SpacetimeContext);

  if (!identity || !identity.Identity) throw new Error("Somehow missing Spacetime identity.");

  return identity;
};
