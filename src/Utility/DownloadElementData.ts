import { Config } from "../module_bindings";
import { DebugLogger } from "./DebugLogger";
import { useSpacetimeContext } from "../Contexts/SpacetimeContext";

export const DownloadElementData = (
  downData: boolean,
  downElement: boolean,
  downLayout: boolean,
  config: Config,
  modals: any,
  setModals: any,
  closeModal: any
) => {
  const { Client } = useSpacetimeContext();

  DebugLogger("Downloading element data");
  const blobData = JSON.stringify(Client.db.elementData.iter());
  const blobElements = JSON.stringify(Client.db.elements.iter());
  const blobLayouts = JSON.stringify(Client.db.layouts.iter());

  const data = new Blob(
    [
      JSON.stringify({
        data: downData ? blobData : null,
        elements: downElement ? blobElements : null,
        layouts: downLayout ? blobLayouts : null,
      }),
    ],
    { type: "text/json" }
  );

  const tempURL = window.URL.createObjectURL(data);
  var tempLink = document.createElement("a");
  tempLink.href = tempURL;
  const timestamp = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).format(
    Date.now()
  );
  tempLink.setAttribute("download", timestamp + " Pogly Backup [" + config.streamName + "].json");
  tempLink.click();
  tempLink.remove();

  closeModal("backup_modal", modals, setModals);
};
