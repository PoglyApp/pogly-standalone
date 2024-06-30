import { createContext } from "react";

export const SettingsContext = createContext<any>({ settings: {}, setSettings: () => {} });
