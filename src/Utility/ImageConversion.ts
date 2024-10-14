import ElementData from "../module_bindings/element_data";

export const convertDataURIToBinary = (dataURI: any) => {
    var base64Index = dataURI.indexOf(';base64,') + ';base64,'.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));
  
    for(var i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
  
    return array;
  };

export const convertBinaryToDataURI = (element: ElementData) => {
    if(!element.byteArray) return element.data;

    var raw = "";
    for (var i = 0; i < element.byteArray.length; i++) {
        raw += String.fromCharCode(element.byteArray[i]);
    }

    const base64 = "data:image/webp;base64," + window.btoa(raw);

    return base64;
}

export const convertBinaryToRaw = (element: ElementData) => {
  if(!element.byteArray) return element.data;

  var raw = "";
  for (var i = 0; i < element.byteArray.length; i++) {
      raw += String.fromCharCode(element.byteArray[i]);
  }

  return raw;
}