import type initSqlJs from "sql.js";
import { DataType } from "../module_bindings";

export class PoglyModuleImporter {
  private SQL: Awaited<ReturnType<typeof initSqlJs>>;
  private db: any | null = null;

  constructor(SQL: Awaited<ReturnType<typeof initSqlJs>>) {
    this.SQL = SQL;
  }

  openFrom = async (src: Uint8Array | ArrayBuffer | Blob | string): Promise<void> => {
    const bytes = await this.loadBytes(src);
    this.db = new this.SQL.Database(bytes);
  };

  close = () => {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  };

  importAll = async (client: any) => {
    let total = 0;

    total += this.importElementData(client);
    total += this.importLayouts(client);
    total += this.importPermissions(client);
    total += this.importElements(client);
    total += this.importConfig(client);

    return { total };
  };

  importNormalBackup = async (client: any) => {
    let total = 0;

    total += this.importElementData(client);
    total += this.importElements(client);
    total += this.importLayouts(client);
    return { total };
  };

  private importConfig = (client: any): number => {
    const cfgRows = this.all(
      `SELECT StreamingPlatform, StreamName, OwnerIdentity, DebugMode, UpdateHz, EditorBorder, Authentication, StrictMode FROM Config LIMIT 1`
    );
    if (cfgRows.length === 0) {
      return 0;
    }
    const cfg = this.keysToCamel(cfgRows[0]);
    const platform = String(cfg.streamingPlatform ?? "");
    const channel = String(cfg.streamName ?? "");
    const ownerIdentity = String(cfg.ownerIdentity ?? "");
    const debug = !!toBool(cfg.debugMode);
    const updateHz = toInt(cfg.updateHz);
    const editorBorder = toInt(cfg.editorBorder);
    const authentication = !!toBool(cfg.authentication);
    const strictMode = !!toBool(cfg.strictMode);

    const zRows = this.all(`SELECT Min, Max FROM ZIndex LIMIT 1`);
    const zmin = zRows.length ? toInt(this.keysToCamel(zRows[0]).min) : 0;
    const zmax = zRows.length ? toInt(this.keysToCamel(zRows[0]).max) : 0;

    const kRows = this.all(`SELECT Key FROM AuthenticationKey LIMIT 1`);
    const authKey = kRows.length ? String(this.keysToCamel(kRows[0]).key ?? "") : "";

    client.reducers.importConfig(
      platform,
      channel,
      ownerIdentity,
      debug,
      updateHz,
      editorBorder,
      authentication,
      strictMode,
      zmin,
      zmax,
      authKey
    );

    return 1;
  };

  private importElementData = (client: any): number => {
    const rows = this.all(
      `SELECT Id, Name, DataType, Data, ByteArray, DataWidth, DataHeight, CreatedBy FROM ElementData`
    );

    let n = 0;

    for (const rRaw of rows) {
      const r = this.keysToCamel(rRaw);
      const id = toUInt(r.id);
      const name = String(r.name ?? "");
      const dataType = mapDataType(r.dataType);
      let data = r.data == null ? "" : String(r.data);
      const bytes = asBytes(r.byteArray);
      const width = toInt(r.dataWidth);
      const height = toInt(r.dataHeight);
      const createdBy = String(r.createdBy ?? "");
      

      if (!data && looksLikeUtf8Json(bytes)) {
        try {
          data = new TextDecoder("utf-8").decode(bytes);
        } catch {
          // Do nothing
        }
      }

      client.reducers.importElementData(id, name, dataType, data, Array.from(bytes), width, height, createdBy);
      n++;
    }

    return n;
  };

  private importLayouts = (client: any): number => {
    const rows = this.all(`SELECT Id, Name, CreatedBy, Active FROM Layouts`);
    let n = 0;
    for (const rRaw of rows) {
      const r = this.keysToCamel(rRaw);
      const id = toUInt(r.id);
      const name = String(r.name ?? "");
      const createdBy = String(r.createdBy ?? "");
      const active = !!toBool(r.active);
      client.reducers.importLayout(id, name, createdBy, active);
      n++;
    }
    return n;
  };

  private importPermissions = (client: any): number => {
    const rows = this.all(`SELECT Identity, PermissionLevel FROM Permissions`);
    let n = 0;
    for (const rRaw of rows) {
      const r = this.keysToCamel(rRaw);
      const identityText = String(r.identity ?? "");
      const level = mapPermissionLevel(r.permissionLevel);
      client.reducers.importPermission(identityText, level);
      n++;
    }
    return n;
  };

  private importElements = (client: any): number => {
    const rows = this.all(`SELECT * FROM Elements`);
    if (rows.length === 0) return 0;

    const widgetDefaults = this.buildWidgetDefaults();

    let n = 0;
    for (const rRaw of rows) {
      const r = this.keysToCamel(rRaw);

      const element = this.reconstructElement(r, widgetDefaults);
      const transparency = toInt(r.transparency);
      const transform = String(r.transform ?? "");
      const clip = String(r.clip ?? "");
      const layoutId = toUInt(r.layoutId);
      const placedBy = String(r.placedBy ?? "");
      const lastEditedBy = String(r.lastEditedBy ?? "");
      const zIndex = toInt(r.zIndex);
      const folderId = r.folderId == null ? null : toUInt(r.folderId);

      client.reducers.importElement(
        element,
        transparency,
        transform,
        clip,
        layoutId,
        placedBy,
        lastEditedBy,
        zIndex,
        folderId
      );
      n++;
    }
    return n;
  };

  private buildWidgetDefaults = (): ((id: number) => string | null) => {
    const rows = this.all(`SELECT Id, DataType, Data FROM ElementData`);
    const map = new Map<number, string | null>();
    for (const rRaw of rows) {
      const r = this.keysToCamel(rRaw);
      const id = toUInt(r.id);
      const data = r.data == null ? null : String(r.data);
      if (data && data.length > 0) map.set(id, data);
    }
    return (id: number) => (map.has(id) ? map.get(id)! : null);
  };

  private reconstructElement = (
    r: any,
    widgetDefaults: (id: number) => string | null
  ): any /* ElementStruct */ => {
    // Tag can be "element_Tag" (raw) or "elementTag" (after keysToCamel)
    const tag = String(firstDefined(r, "element_Tag", "elementTag") ?? "");

    if (tag === "TextElement") {
      const value = {
        // Text columns in both styles
        text:  getStr(r, "textElement_Text",  "textElementText"),
        size:  getInt(r, "textElement_Size",  "textElementSize"),
        color: getStr(r, "textElement_Color", "textElementColor"),
        font:  getStr(r, "textElement_Font",  "textElementFont"),
        css:   getStr(r, "textElement_Css",   "textElementCss"),
      };
      return { tag: "TextElement", value };
    }

    if (tag === "ImageElement") {
      // Flattened inner sum: tag + either elementDataId or rawData
      const dataTag = String(
        firstDefined(
          r,
          "imageElement_ImageElementData_Tag",
          "imageElementImageElementDataTag"
        ) ?? ""
      );

      let imageElementData: any;
      if (dataTag === "ElementDataId") {
        const id = getIntOrNull(
          r,
          "imageElement_ImageElementData_ElementDataId",
          "imageElementImageElementDataElementDataId"
        ) ?? 0;
        imageElementData = { tag: "ElementDataId", value: id };
      } else {
        const raw = getStr(
          r,
          "imageElement_ImageElementData_RawData",
          "imageElementImageElementDataRawData"
        );
        imageElementData = { tag: "RawData", value: raw };
      }

      const value = {
        imageElementData,
        width:  getInt(r, "imageElement_Width",  "imageElementWidth"),
        height: getInt(r, "imageElement_Height", "imageElementHeight"),
      };
      return { tag: "ImageElement", value };
    }

    if (tag === "WidgetElement") {
      const elementDataId = getIntOrNull(
        r,
        "widgetElement_ElementDataId",
        "widgetElementElementDataId"
      );
      const width  = getInt(r, "widgetElement_Width",  "widgetElementWidth");
      const height = getInt(r, "widgetElement_Height", "widgetElementHeight");
      let raw: string = getStr(r, "widgetElement_RawData", "widgetElementRawData");

      // Fallback: if rawData empty but we have a template in ElementData.Data
      if ((!raw || raw.length === 0) && elementDataId != null) {
        raw = widgetDefaults(elementDataId) ?? "";
      }

      const value = {
        elementDataId: elementDataId ?? 0,
        width,
        height,
        rawData: raw,
      };
      return { tag: "WidgetElement", value };
    }

    throw new Error(`Unknown Element_Tag '${tag}'`);
  };

  private all = (sql: string): any[] => {
    const db = this.requireDb();
    const stmt = db.prepare(sql);
    const rows: any[] = [];
    try {
      while (stmt.step()) rows.push(stmt.getAsObject());
    } finally {
      stmt.free?.();
    }
    return rows;
  };

  private keysToCamel = (row: Record<string, any>): Record<string, any> => {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      out[toCamel(k)] = v;
    }
    return out;
  };

  private loadBytes = async (src: Uint8Array | ArrayBuffer | Blob | string): Promise<Uint8Array> => {
    if (src instanceof Uint8Array) return src;
    if (src instanceof ArrayBuffer) return new Uint8Array(src);
    if (typeof src === "string") {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`Failed to fetch sqlite file: ${res.status} ${res.statusText}`);
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    }
    const buf = await (src as Blob).arrayBuffer();
    return new Uint8Array(buf);
  };

  private requireDb = () => {
    if (!this.db) throw new Error("Database not opened. Call openFrom(...) first.");
    return this.db;
  };
}

const toCamel = (s: string): string =>
  s
    .replace(/[_-]([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]+$/, (x) => x.toLowerCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());

const toInt = (x: any): number => (x == null ? 0 : Number(x) | 0);
const toUInt = (x: any): number => {
  const n = toInt(x);
  return n < 0 ? 0 : n >>> 0;
};
const toBool = (x: any): boolean => !!(typeof x === "boolean" ? x : Number(x));

const asBytes = (val: any): Uint8Array => {
  if (val == null) return new Uint8Array(0);
  if (val instanceof Uint8Array) return val;
  if (Array.isArray(val)) return new Uint8Array(val);
  if (val.buffer && typeof val.byteLength === "number") return new Uint8Array(val as ArrayBufferLike);
  return new Uint8Array(0);
};

const looksLikeUtf8Json = (bytes: Uint8Array): boolean => {
  if (!bytes || bytes.length === 0) return false;
  let i = 0;
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) i = 3;
  while (i < bytes.length && (bytes[i] === 0x20 || bytes[i] === 0x0a || bytes[i] === 0x0d || bytes[i] === 0x09)) i++;
  if (i >= bytes.length) return false;
  const ch = bytes[i];
  return ch === 0x7b || ch === 0x5b;
};

const mapDataType = (x: any): any => {
  const n = toInt(x);
  switch (n) {
    case 0: return DataType.TextElement;
    case 1: return DataType.ImageElement;
    case 2: return DataType.WidgetElement;
    default: return DataType.TextElement;
  }
};

const mapPermissionLevel = (x: any): string => {
  switch (toInt(x)) {
    case 1: return 'Editor';
    case 2: return 'Moderator';
    case 3: return 'Owner';
    default: return 'None';
  }
};

const firstDefined = (obj: any, ...keys: string[]) => {
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
};
const getStr = (obj: any, ...keys: string[]) =>
  firstDefined(obj, ...keys) == null ? "" : String(firstDefined(obj, ...keys));
const getInt = (obj: any, ...keys: string[]) => {
  const v = firstDefined(obj, ...keys);
  return v == null ? 0 : Number(v) | 0;
};
const getIntOrNull = (obj: any, ...keys: string[]) => {
  const v = firstDefined(obj, ...keys);
  return v == null ? null : Number(v) | 0;
};