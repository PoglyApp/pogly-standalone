import { AuditLog } from "../module_bindings";
import { DebugLogger } from "./DebugLogger";

export const ParseAuditLog = (auditLog: AuditLog) => {
  DebugLogger("Parsing audit log");
  let ret = "";

  switch (auditLog.reducer) {
    //Chat
    case "SendMessage":
      ret = parseChat(auditLog);
      break;

    //Add Reducers (no OldChange)
    case "AddElement":
      ret = parseAdd(auditLog);
      break;
    case "AddElementData":
      ret = parseAdd(auditLog);
      break;
    case "Init":
      ret = parseAdd(auditLog);
      break;
    case "OnConnect":
      ret = parseAdd(auditLog);
      break;

    //Delete Reducers (no NewChange)
    case "DeleteElement":
      ret = parseDelete(auditLog);
      break;
    case "DeleteAllElements":
      ret = parseDelete(auditLog);
      break;
    case "DeleteElementDataById":
      ret = parseDelete(auditLog);
      break;
    case "DeleteElementDataByName":
      ret = parseDelete(auditLog);
      break;
    case "DeleteAllElementData":
      ret = parseDelete(auditLog);
      break;
    case "OnDisconnect":
      ret = parseDelete(auditLog);
      break;

    //Update Reducers (both OldChange and newChange)
    case "UpdateGuest":
      ret = parse(auditLog);
      break;
    case "UpdateGuestNickname":
      ret = parse(auditLog);
      break;
    case "UpdateGuestSelectedElement":
      ret = parse(auditLog);
      break;
    case "UpdateGuestPosition":
      ret = parse(auditLog);
      break;
    case "UpdateElement":
      ret = parse(auditLog);
      break;
    case "UpdateElementStruct":
      ret = parse(auditLog);
      break;
    case "UpdateElementTransparency":
      ret = parse(auditLog);
      break;
    case "UpdateElementTransform":
      ret = parse(auditLog);
      break;
    case "UpdateElementClip":
      ret = parse(auditLog);
      break;
    case "UpdateElementZIndex":
      ret = parse(auditLog);
      break;
    case "UpdateElementData":
      ret = parse(auditLog);
      break;
    case "UpdateElementDataName":
      ret = parse(auditLog);
      break;
    case "UpdateElementDataData":
      ret = parse(auditLog);
      break;
  }

  if (ret == "") return;

  let d = new Date(Number(auditLog.unixTime) * 1000).toLocaleTimeString();

  return `[${d}] ${ret}`;
};

const parseChat = (auditLog: AuditLog) => {
  DebugLogger("Parsing chat");

  var message = "";
  if (auditLog.newChange.tag == "ChatMessage") message = auditLog.newChange.value.message;

  return `${parseUser(auditLog)}: ${message}`;
};

const parseAdd = (auditLog: AuditLog) => {
  DebugLogger("Parsing add");

  var ret = "";
  switch (auditLog.newChange.tag) {
    case "ElementChange":
      ret = `${parseUser(auditLog)} added Element Id#${auditLog.newChange.value.id} of type ${
        auditLog.newChange.value.element.tag
      }!`;
      break;
    case "ElementDataChange":
      ret = `${parseUser(auditLog)} added ElementData Id#${auditLog.newChange.value.id} of type ${
        auditLog.newChange.value.dataType.tag
      } named ${auditLog.newChange.value.name}!`;
      break;
    case "GuestChange":
      ret = `${parseUser(auditLog)} has joined!`;
      break;
    case "ChatMessage":
      ret = parseChat(auditLog);
      break;
    case "EmptyChange":
      break;
  }

  return ret;
};

const parseDelete = (auditLog: AuditLog) => {
  DebugLogger("Parsing delete");

  var ret = "";
  switch (auditLog.oldChange.tag) {
    case "ElementChange":
      ret = `${parseUser(auditLog)} deleted Element Id#${auditLog.oldChange.value.id} of type ${
        auditLog.oldChange.value.element.tag
      }!`;
      break;
    case "ElementDataChange":
      ret = `${parseUser(auditLog)} deleted ElementData Id#${auditLog.oldChange.value.id} of type ${
        auditLog.oldChange.value.dataType.tag
      } named ${auditLog.oldChange.value.name}!`;
      break;
    case "GuestChange":
      ret = `${parseUser(auditLog)} has left!`;
      break;
    case "ChatMessage":
      ret = parseChat(auditLog);
      break;
    case "EmptyChange":
      break;
  }

  return ret;
};

const parse = (auditLog: AuditLog) => {
  DebugLogger("Parsing");

  var ret = "";
  switch (auditLog.newChange.tag) {
    case "ElementChange":
      ret = `${parseUser(auditLog)} updated Element Id#${auditLog.newChange.value.id} of type ${
        auditLog.newChange.value.element.tag
      }!`;
      break;
    case "ElementDataChange":
      ret = `${parseUser(auditLog)} updated ElementData Id#${auditLog.newChange.value.id} of type ${
        auditLog.newChange.value.dataType.tag
      } named ${auditLog.newChange.value.name}!`;
      break;
    case "GuestChange":
      ret = `${parseUser(auditLog)} updated Guest Id#${auditLog.id}!`;
      break;
    case "ChatMessage":
      break;
    case "EmptyChange":
      break;
  }

  return ret;
};

const parseUser = (auditLog: AuditLog) => {
  DebugLogger("Parsing user");

  //return Guests.filterByIdentity(identity)?.nickname;
  //var username = auditLog.identity.toHexString() === "9e1bf1818e936b740a820a78cd5f63596a8b637253a6da402b75d6d0f9fdd7bd" ? "Server" : identity.toHexString();

  return auditLog.nickname ? auditLog.nickname : auditLog.identity.toHexString();
};

// https://i.imgur.com/pZQReBe.png
