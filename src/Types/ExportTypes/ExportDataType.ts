import AuthenticationKey from "../../module_bindings/authentication_key";
import Config from "../../module_bindings/config";
import ElementData from "../../module_bindings/element_data";
import Elements from "../../module_bindings/elements";
import Layouts from "../../module_bindings/layouts";
import Permissions from "../../module_bindings/permissions";
import ZIndex from "../../module_bindings/z_index";

export type ExportData = {
  Config?: Config[];
  Elements?: Elements[];
  ElementData?: ElementData[];
  Layouts?: Layouts[];
  Permissions?: Permissions[];
  AuthenticationKey?: AuthenticationKey[];
  ZIndex?: ZIndex[];
};