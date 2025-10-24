import { AuthenticationKey, Config, ElementData, Elements, Layouts, Permissions, ZIndex } from "../../module_bindings";

export type ExportData = {
  Config?: Config[];
  Elements?: Elements[];
  ElementData?: ElementData[];
  Layouts?: Layouts[];
  Permissions?: Permissions[];
  AuthenticationKey?: AuthenticationKey[];
  ZIndex?: ZIndex[];
};
