import { createContext } from "react";
import Layouts from "../module_bindings/layouts";

export const LayoutContext = createContext<Layouts | undefined>(undefined);
