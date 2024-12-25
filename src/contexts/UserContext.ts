import { UserType } from "@/types/UserType.ts";
import { createContext } from "react";

export const UserContext = createContext<UserType | undefined>(undefined);
