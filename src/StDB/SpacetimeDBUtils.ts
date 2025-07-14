import { DbConnection, ElementData, Layouts } from "../module_bindings";

export const getElementDataByID = (Client: DbConnection, elementDataID: number) => {
  return (Client.db.elementData.iter() as ElementData[]).find(
    (data: ElementData) => data.id === elementDataID
  ) as ElementData;
};

export const getActiveLayout = (Client: DbConnection) => {
  return (Client.db.layouts.iter() as Layouts[]).find((l: Layouts) => l.active === true)!;
};
