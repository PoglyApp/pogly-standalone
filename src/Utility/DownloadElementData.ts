import Config from "../module_bindings/config";
import ElementData from "../module_bindings/element_data";

export const DownloadElementData = (config: Config) => {
    const data = new Blob([JSON.stringify(ElementData.all())], {type: 'text/json'});
    const tempURL = window.URL.createObjectURL(data);
    var tempLink = document.createElement('a');
    tempLink.href = tempURL;
    const timestamp = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(Date.now());
    tempLink.setAttribute('download',timestamp+" Pogly v"+config.version+" ElementData Backup for channel ["+config.streamName+"].json");
    tempLink.click();
    tempLink.remove();
};