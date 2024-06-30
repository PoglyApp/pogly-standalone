import AddElementDataReducer from "../module_bindings/add_element_data_reducer";

export const UploadElementDataFromFile = (backupFile: any) => {
  let reader = new FileReader();
  let data;
  let error;

  reader.readAsText(backupFile);

  reader.onload = function () {
    if (!reader.result) return;

    data = reader.result.toString();
    var elements = JSON.parse(data) as any[];
    elements.forEach((e) => {
      AddElementDataReducer.call(e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
    });
  };

  reader.onerror = function (e) {
    error = e;
    console.log("error, incorrectly loaded backup file-- need to make proper modal for this");
  };
};

export const UploadElementDataFromString = (data: string) => {
  var elements = JSON.parse(data) as any[];
  elements.forEach((e) => {
    AddElementDataReducer.call(e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
  });
};
