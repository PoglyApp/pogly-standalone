import { Identity } from "spacetimedb";
import { DbConnection, ElementData, Elements, GuestNames, Guests, Layouts, Permissions } from "../module_bindings";
import { Editor } from "../Types/General/Editor";

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

export const getLayoutByName = (Client: DbConnection, name: string) => {
  return (Client.db.layouts.iter() as Layouts[]).find((Layout: Layouts) => Layout.name === name);
};

export const getGuestNickname = (Client: DbConnection, identity: Identity) => {
  return (Client.db.guests.iter() as Guests[]).find((g: Guests) => g.identity === identity)!;
};

export const getAllEditors = (Client: DbConnection) => {
  const guests: GuestNames[] = Client.db.guestNames.iter() as GuestNames[];
  const permissions: Permissions[] = Client.db.guests.iter() as Permissions[];

  const editors: Editor[] = [];

  guests.forEach((guest: GuestNames) => {
    editors.push({
      identity: guest.identity,
      nickname: guest.nickname,
      platform: guest.streamingPlatform,
      avatar: guest.avatarUrl,
      permissions: permissions.filter((permission) => permission.identity === guest.identity) as Permissions[],
    });
  });

  return editors;
};
