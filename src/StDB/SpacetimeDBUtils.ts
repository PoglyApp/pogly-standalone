import { Identity } from "spacetimedb";
import { DbConnection, ElementData, Guests, Layouts } from "../module_bindings";

export const getElementDataByID = (Client: DbConnection, elementDataID: number) => {
  return (Client.db.elementData.iter() as ElementData[]).find(
    (data: ElementData) => data.id === elementDataID
  ) as ElementData;
};

export const getActiveLayout = (Client: DbConnection) => {
  return (Client.db.layouts.iter() as Layouts[]).find((l: Layouts) => l.active === true)!;
};

export const getLayoutByName = (Client: DbConnection, name: string) => {
  return (Client.db.layouts.iter() as Layouts[]).find((Layout: Layouts) => Layout.name === name);
};

export const getGuestNickname = (Client: DbConnection, identity: Identity) => {
  return (Client.db.guests.iter() as Guests[]).find((g: Guests) => g.identity === identity)!;
};
