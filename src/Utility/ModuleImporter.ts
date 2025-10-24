import type initSqlJs from "sql.js";

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
      console.log(r.dataType);

      const id = toUInt(r.id);
      const name = String(r.name ?? "");
      const dataType = toInt(r.dataType);
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

      console.log("id", id);
      console.log("name", name);
      console.log("dataType", dataType);
      console.log("data", data);
      console.log("bytes", Array.from(bytes));
      console.log("width", width);
      console.log("height", height);
      console.log("createdBy", createdBy);

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
      const level = String(r.permissionLevel ?? "");
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

  private reconstructElement = (r: any, widgetDefaults: (id: number) => string | null): any => {
    const tag: string = String(r.element_Tag ?? r.elementTag ?? "");
    switch (tag) {
      case "TextElement": {
        const te = {
          Text: String(r.textElement_Text ?? ""),
          Size: r.textElement_Size == null ? 0 : toInt(r.textElement_Size),
          Color: String(r.textElement_Color ?? ""),
          Font: String(r.textElement_Font ?? ""),
          Css: String(r.textElement_Css ?? ""),
        };
        return { tag: "TextElement", TextElement_: te };
      }
      case "ImageElement": {
        let dataCase: any;
        const dataTag = String(r.imageElement_ImageElementData_Tag ?? "");
        if (dataTag === "ElementDataId") {
          const id =
            r.imageElement_ImageElementData_ElementDataId == null
              ? 0
              : toUInt(r.imageElement_ImageElementData_ElementDataId);
          dataCase = { kind: "ElementDataId", ElementDataId_: id };
        } else {
          const raw = String(r.imageElement_ImageElementData_RawData ?? "");
          dataCase = { kind: "RawData", RawData_: raw };
        }
        const ie = {
          ImageElementData: dataCase,
          Width: r.imageElement_Width == null ? 0 : toInt(r.imageElement_Width),
          Height: r.imageElement_Height == null ? 0 : toInt(r.imageElement_Height),
        };
        return { tag: "ImageElement", ImageElement_: ie };
      }
      case "WidgetElement": {
        const elementDataId = r.widgetElement_ElementDataId == null ? null : toUInt(r.widgetElement_ElementDataId);
        const width = r.widgetElement_Width == null ? 0 : toInt(r.widgetElement_Width);
        const height = r.widgetElement_Height == null ? 0 : toInt(r.widgetElement_Height);
        let raw: string | null = r.widgetElement_RawData == null ? null : String(r.widgetElement_RawData);

        if ((!raw || raw.length === 0) && elementDataId != null) {
          raw = widgetDefaults(elementDataId);
        }
        const we = {
          ElementDataId: elementDataId ?? 0,
          Width: width,
          Height: height,
          RawData: raw ?? "",
        };
        return { tag: "WidgetElement", WidgetElement_: we };
      }
      default:
        throw new Error(`Unknown Element_Tag '${tag}'`);
    }
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
