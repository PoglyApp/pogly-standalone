import { Identity } from "spacetimedb";
import { DbConnection, ElementData, Elements, Guests, Layouts } from "../module_bindings";

export const getElementByID = (Client: DbConnection, elementID: number) => {
  return (Client.db.elements.iter() as Elements[]).find((data: Elements) => data.id === elementID) as Elements;
};

export const getElementDataByID = (Client: DbConnection, elementDataID: number) => {
  return (Client.db.elementData.iter() as ElementData[]).find(
    (data: ElementData) => data.id === elementDataID
  ) as ElementData;
};

export const getActiveLayout = (Client: DbConnection) => {
  return (Client.db.layouts.iter() as Layouts[]).find((l: Layouts) => l.active === true)!;
};

export const getGuestNickname = (Client: DbConnection, identity: Identity) => {
  return (Client.db.guests.iter() as Guests[]).find((g: Guests) => g.identity === identity)!;
};
