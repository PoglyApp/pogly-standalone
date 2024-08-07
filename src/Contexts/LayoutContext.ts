import { createContext } from "react";
import Layouts from "../module_bindings/layouts";

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export type LayoutContextType = {
  activeLayout: Layouts;
  setActiveLayout: Function;
};
