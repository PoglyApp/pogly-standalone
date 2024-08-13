import ElementData from "../module_bindings/element_data";
import Elements from "../module_bindings/elements";
import Layouts from "../module_bindings/layouts";
import Config from "../module_bindings/config";

export const DownloadElementData = (downData: boolean, downElement: boolean, downLayout: boolean, config: Config, modals: any, setModals: any, closeModal: any) => {
    const blobData = JSON.stringify(ElementData.all());
    const blobElements = JSON.stringify(Elements.all());
    const blobLayouts = JSON.stringify(Layouts.all());
    
    const data = new Blob([JSON.stringify({
        data: downData ? blobData : null,
        elements: downElement ? blobElements : null,
        layouts: downLayout ? blobLayouts : null
    })], {type: 'text/json'});

    const tempURL = window.URL.createObjectURL(data);
    var tempLink = document.createElement('a');
    tempLink.href = tempURL;
    const timestamp = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(Date.now());
    tempLink.setAttribute('download',timestamp+" Pogly Backup ["+config.streamName+"].json");
    tempLink.click();
    tempLink.remove();
    
    closeModal("backup_modal", modals, setModals);
};