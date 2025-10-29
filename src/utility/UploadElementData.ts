import { DebugLogger } from "./DebugLogger";
import { DbConnection } from "../module_bindings";
import initSqlJs from "sql.js";
import { PoglyModuleImporter } from "./ModuleImporter";

export const UploadElementDataFromFile = (Client: DbConnection, backupFile: any) => {
  DebugLogger("Uploading element data from file");
  let reader = new FileReader();
  let data;
  let error;

  reader.readAsText(backupFile);

  reader.onload = function () {
    if (!reader.result) return;

    data = reader.result.toString();
    var elements = JSON.parse(data) as any[];
    elements.forEach((e) => {
      Client.reducers.addElementData(e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
    });
  };

  reader.onerror = function (e) {
    error = e;
    console.log("error, incorrectly loaded backup file-- need to make proper modal for this");
  };
};

export const UploadElementDataFromString = (Client: DbConnection, data: string) => {
  DebugLogger("Uploading element data from string");
  var elements = JSON.parse(data) as any[];
  elements.forEach((e) => {
    Client.reducers.addElementData(e.name, e.dataType, e.data, e.dataWidth || 128, e.dataHeight || 128);
  });
};

export const UploadBackupFromFile = async (
  Client: DbConnection,
  backupFile: any,
  deleteOnUpload: boolean,
  reload?: boolean,
  setBackupRowCount?: Function
) => {
  if (deleteOnUpload) {
    Client.reducers.deleteAllElements();
    Client.reducers.deleteAllElementData();
    Client.reducers.deleteAllLayouts(false);
    Client.reducers.deleteAllFolders(false);
  }

  const SQL = await initSqlJs({ locateFile: (file: any) => `https://sql.js.org/dist/${file}` });

  const importer = new PoglyModuleImporter(SQL);

  await importer.openFrom(backupFile);

  if (setBackupRowCount) {
    setBackupRowCount(await importer.getNormalBackupRowCount());
  }

  await importer.importNormalBackup(Client);

  importer.close();

  if (reload) {
    setTimeout(function () {
      window.location.reload();
    }, 1000);
  }
};
