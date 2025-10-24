import ElementData from "../module_bindings/element_data";
import Elements from "../module_bindings/elements";
import Layouts from "../module_bindings/layouts";
import Config from "../module_bindings/config";
import initSqlJs from "sql.js";
import { PoglyModuleExporter } from "./ModuleExporter";
import { IncludeFlags } from "../Types/ExportTypes/IncludeFlagsType";

export const DownloadElementData = async (
  downData: boolean,
  downElement: boolean,
  downLayout: boolean,
  config: Config,
  modals: any,
  setModals: any,
  closeModal: any
) => {
  const elementData: ElementData[] = ElementData.all() as ElementData[];
  const elements: Elements[] = Elements.all() as Elements[];
  const layouts: Layouts[] = Layouts.all() as Layouts[];

  const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
  const exporter = new PoglyModuleExporter(SQL);

  const { blob } = exporter.buildAndExport(
    {
      ElementData: downData ? elementData : undefined,
      Elements: downElement ? elements : undefined,
      Layouts: downLayout ? layouts : undefined,
    },
    {
      ElementData: true,
      Elements: true,
      Layouts: true,
    } as IncludeFlags
  );

  const timestamp = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).format(
    Date.now()
  );

  exporter.triggerDownload(`${timestamp} + Pogly Backup [${config.streamName}].sqlite`, blob);

  closeModal("backup_modal", modals, setModals);
};
