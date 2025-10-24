import type initSqlJs from "sql.js";
import { IncludeFlags } from "../Types/ExportTypes/IncludeFlagsType";
import { PragmasOptions } from "../Types/ExportTypes/PragmasOptionsType";
import { ExportData } from "../Types/ExportTypes/ExportDataType";

const IncludeAll: IncludeFlags = {
  Config: true,
  Elements: true,
  ElementData: true,
  Layouts: true,
  Permissions: true,
  AuthenticationKey: true,
  ZIndex: true,
};

export class PoglyModuleExporter {
  private SQL: Awaited<ReturnType<typeof initSqlJs>>;
  private db: any | null = null;
  private pragmas: PragmasOptions;

  constructor(SQL: Awaited<ReturnType<typeof initSqlJs>>, pragmas: PragmasOptions = {}) {
    this.SQL = SQL;
    this.pragmas = pragmas;
  }

  open = () => {
    this.db = new this.SQL.Database();
    const db = this.requireDb();

    const journal = this.pragmas.journal_mode ?? "DELETE";
    const sync = this.pragmas.synchronous ?? "NORMAL";
    const fkeys = this.pragmas.foreign_keys ?? false;
    const temp = this.pragmas.temp_store ?? "MEMORY";

    db.run(`PRAGMA journal_mode=${journal};`);
    db.run(`PRAGMA synchronous=${sync};`);
    db.run(`PRAGMA foreign_keys=${fkeys ? "ON" : "OFF"};`);
    db.run(`PRAGMA temp_store=${temp};`);
  };

  close = () => {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  };

  buildAndExport = (data: ExportData, include: IncludeFlags = IncludeAll) => {
    this.open();
    try {
      this.createSchema(include);
      this.insertAll(data, include);
      this.requireDb().run("VACUUM;");
      const uint8: any = this.toUint8Array();
      return { uint8, blob: new Blob([uint8], { type: "application/x-sqlite3" }) };
    } finally {
      this.close();
    }
  };

  toUint8Array = (): Uint8Array => {
    return this.requireDb().export();
  };

  triggerDownload = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  createSchema = (include: IncludeFlags) => {
    const db = this.requireDb();

    if (include.Config)
      db.run(`
CREATE TABLE IF NOT EXISTS Config (
  Version           INTEGER NOT NULL,
  OwnerIdentity     TEXT    NOT NULL,
  StreamingPlatform TEXT    NOT NULL,
  StreamName        TEXT    NOT NULL,
  DebugMode         INTEGER NOT NULL,
  UpdateHz          INTEGER NOT NULL,
  EditorBorder      INTEGER NOT NULL,
  Authentication    INTEGER NOT NULL,
  StrictMode        INTEGER NOT NULL,
  EditorGuidelines  TEXT    NOT NULL,
  ConfigInit        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_Config_Version ON Config(Version);
`);

    if (include.Elements)
      db.run(`
CREATE TABLE IF NOT EXISTS Elements (
  Id               INTEGER PRIMARY KEY,
  Element_Tag      TEXT    NOT NULL,
  Transparency     INTEGER NOT NULL,
  Transform        TEXT    NOT NULL,
  Clip             TEXT    NOT NULL,
  Locked           INTEGER NOT NULL,
  FolderId         INTEGER,
  LayoutId         INTEGER NOT NULL,
  PlacedBy         TEXT    NOT NULL,
  LastEditedBy     TEXT    NOT NULL,
  ZIndex           INTEGER NOT NULL,

  TextElement_Text TEXT,
  TextElement_Size INTEGER,
  TextElement_Color TEXT,
  TextElement_Font TEXT,
  TextElement_Css  TEXT,

  ImageElement_ImageElementData_Tag TEXT,
  ImageElement_ImageElementData_ElementDataId INTEGER,
  ImageElement_ImageElementData_RawData TEXT,
  ImageElement_Width  INTEGER,
  ImageElement_Height INTEGER,

  WidgetElement_ElementDataId INTEGER,
  WidgetElement_Width  INTEGER,
  WidgetElement_Height INTEGER,
  WidgetElement_RawData TEXT
);
CREATE INDEX IF NOT EXISTS idx_Elements_LayoutId ON Elements(LayoutId);
CREATE INDEX IF NOT EXISTS idx_Elements_ZIndex   ON Elements(ZIndex);
`);

    if (include.ElementData)
      db.run(`
CREATE TABLE IF NOT EXISTS ElementData (
  Id         INTEGER PRIMARY KEY,
  Name       TEXT    NOT NULL,
  DataType   INTEGER NOT NULL,
  Data       TEXT    NOT NULL,
  ByteArray  BLOB,
  DataWidth  INTEGER NOT NULL,
  DataHeight INTEGER NOT NULL,
  CreatedBy  TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ElementData_Name ON ElementData(Name);
CREATE INDEX IF NOT EXISTS idx_ElementData_DataType ON ElementData(DataType);
`);

    if (include.Layouts)
      db.run(`
CREATE TABLE IF NOT EXISTS Layouts (
  Id        INTEGER PRIMARY KEY,
  Name      TEXT    NOT NULL,
  CreatedBy TEXT    NOT NULL,
  Active    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_Layouts_Active ON Layouts(Active);
`);

    if (include.Permissions)
      db.run(`
CREATE TABLE IF NOT EXISTS Permissions (
  Identity        TEXT    NOT NULL,
  PermissionLevel INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_Permissions_Identity ON Permissions(Identity);
`);

    if (include.AuthenticationKey)
      db.run(`
CREATE TABLE IF NOT EXISTS AuthenticationKey (
  Version INTEGER NOT NULL,
  Key     TEXT    NOT NULL
);
`);

    if (include.ZIndex)
      db.run(`
CREATE TABLE IF NOT EXISTS ZIndex (
  Version INTEGER NOT NULL,
  Min     INTEGER NOT NULL,
  Max     INTEGER NOT NULL,
  Ceiling INTEGER NOT NULL
);
`);
  };

  insertAll = (data: ExportData, include: IncludeFlags) => {
    if (include.Config && data.Config) this.insertConfig(data.Config);
    if (include.Elements && data.Elements) this.insertElements(data.Elements);
    if (include.ElementData && data.ElementData) this.insertElementData(data.ElementData);
    if (include.Layouts && data.Layouts) this.insertLayouts(data.Layouts);
    if (include.Permissions && data.Permissions) this.insertPermissions(data.Permissions);
    if (include.AuthenticationKey && data.AuthenticationKey) this.insertAuthenticationKey(data.AuthenticationKey);
    if (include.ZIndex && data.ZIndex) this.insertZIndex(data.ZIndex);
  };

  insertConfig = (rows: Iterable<any>) => {
    const db = this.requireDb();
    const stmt = db.prepare(`
INSERT INTO Config
(Version, OwnerIdentity, StreamingPlatform, StreamName, DebugMode, UpdateHz, EditorBorder, Authentication, StrictMode, EditorGuidelines, ConfigInit)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`);
    this.runMany(stmt, rows, (r) => [
      toInt(r.version),
      str(r.ownerIdentity),
      strOrEmpty(r.streamingPlatform),
      strOrEmpty(r.streamName),
      bool01(r.debugMode),
      toInt(r.updateHz),
      toInt(r.editorBorder),
      bool01(r.authentication),
      bool01(r.strictMode),
      strOrEmpty(r.editorGuidelines),
      bool01(r.configInit),
    ]);
  };

  insertElements = (rows: Iterable<any>) => {
    const db = this.requireDb();
    const stmt = db.prepare(`
INSERT INTO Elements
(Id, Element_Tag, Transparency, Transform, Clip, Locked, FolderId, LayoutId, PlacedBy, LastEditedBy, ZIndex,
 TextElement_Text, TextElement_Size, TextElement_Color, TextElement_Font, TextElement_Css,
 ImageElement_ImageElementData_Tag, ImageElement_ImageElementData_ElementDataId, ImageElement_ImageElementData_RawData, ImageElement_Width, ImageElement_Height,
 WidgetElement_ElementDataId, WidgetElement_Width, WidgetElement_Height, WidgetElement_RawData)
VALUES
(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`);

    this.runMany(stmt, rows, (r) => {
      const flat = flattenElement(r.element);
      return [
        toInt(r.id),
        strOrEmpty(flat.Tag),
        toInt(r.transparency),
        strOrEmpty(r.transform),
        strOrEmpty(r.clip),
        bool01(r.locked),
        nullableInt(r.folderId),
        toInt(r.layoutId),
        strOrEmpty(r.placedBy),
        strOrEmpty(r.lastEditedBy),
        toInt(r.zIndex),

        nullableStr(flat.TextElement_Text),
        nullableInt(flat.TextElement_Size),
        nullableStr(flat.TextElement_Color),
        nullableStr(flat.TextElement_Font),
        nullableStr(flat.TextElement_Css),

        nullableStr(flat.ImageElement_ImageElementData_Tag),
        nullableInt(flat.ImageElement_ImageElementData_ElementDataId),
        nullableStr(flat.ImageElement_ImageElementData_RawData),
        nullableInt(flat.ImageElement_Width),
        nullableInt(flat.ImageElement_Height),

        nullableInt(flat.WidgetElement_ElementDataId),
        nullableInt(flat.WidgetElement_Width),
        nullableInt(flat.WidgetElement_Height),
        nullableStr(flat.WidgetElement_RawData),
      ];
    });
  };

  insertElementData = (rows: Iterable<any>) => {
    const db = this.requireDb();
    const stmt = db.prepare(`
INSERT INTO ElementData
(Id, Name, DataType, Data, ByteArray, DataWidth, DataHeight, CreatedBy)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`);
    this.runMany(stmt, rows, (r) => [
      toInt(r.id),
      strOrEmpty(r.name),
      toInt(r.dataType),
      strOrEmpty(r.data),
      r.byteArray ?? null,
      toInt(r.dataWidth),
      toInt(r.dataHeight),
      strOrEmpty(r.createdBy),
    ]);
  };

  insertLayouts = (rows: Iterable<any>) => {
    const db = this.requireDb();
    const stmt = db.prepare(`
INSERT INTO Layouts
(Id, Name, CreatedBy, Active)
VALUES (?, ?, ?, ?);
`);
    this.runMany(stmt, rows, (r) => [toInt(r.id), strOrEmpty(r.name), strOrEmpty(r.createdBy), bool01(r.active)]);
  };

  insertPermissions = (rows: Iterable<any>) => {
    const db = this.requireDb();
    const stmt = db.prepare(`
INSERT INTO Permissions
(Identity, PermissionLevel)
VALUES (?, ?);
`);
    this.runMany(stmt, rows, (r) => [str(r.identity), toInt(r.permissionLevel)]);
  };

  insertAuthenticationKey = (rows: Iterable<any>) => {
    const db = this.requireDb();
    const stmt = db.prepare(`
INSERT INTO AuthenticationKey
(Version, Key)
VALUES (?, ?);
`);
    this.runMany(stmt, rows, (r) => [toInt(r.version), strOrEmpty(r.key)]);
  };

  insertZIndex = (rows: Iterable<any>) => {
    const db = this.requireDb();
    const stmt = db.prepare(`
INSERT INTO ZIndex
(Version, Min, Max, Ceiling)
VALUES (?, ?, ?, ?);
`);
    this.runMany(stmt, rows, (r) => [toInt(r.version), toInt(r.min), toInt(r.max), toInt(r.ceiling)]);
  };

  private runMany = (stmt: any, rows: Iterable<any>, map: (r: any) => any[]) => {
    const db = this.requireDb();
    db.run("BEGIN");
    try {
      for (const r of rows) stmt.run(map(r));
      db.run("COMMIT");
    } catch (e) {
      db.run("ROLLBACK");
      throw e;
    } finally {
      stmt.free?.();
    }
  };

  private requireDb = () => {
    if (!this.db) throw new Error("Database not opened. Use open() or buildAndExport().");
    return this.db;
  };
}

const toInt = (x: any): number => (x ?? 0) | 0;
const bool01 = (x: any): 0 | 1 => (x ? 1 : 0);
const str = (x: any): string => String(x ?? "");
const strOrEmpty = (x: any): string => (x ?? "") + "";
const nullableStr = (x: any): string | null => (x == null ? null : String(x));
const nullableInt = (x: any): number | null => (x == null ? null : x | 0);

const flattenElement = (element: any): any => {
  if (!element || typeof element !== "object") return {};
  if ("Tag" in element || "TextElement_Text" in element) return element;

  const out: any = {};
  const tag = element.tag || element.Tag || "";

  switch (tag) {
    case "TextElement": {
      out.Tag = "TextElement";
      const t = element.TextElement_ || {};
      out.TextElement_Text = t.Text ?? null;
      out.TextElement_Size = t.Size ?? null;
      out.TextElement_Color = t.Color ?? null;
      out.TextElement_Font = t.Font ?? null;
      out.TextElement_Css = t.Css ?? null;
      break;
    }
    case "ImageElement": {
      out.Tag = "ImageElement";
      const img = element.ImageElement_ || {};
      out.ImageElement_Width = img.Width ?? null;
      out.ImageElement_Height = img.Height ?? null;
      const d = img.ImageElementData || {};
      if (d.kind === "ElementDataId" || d.Tag === "ElementDataId") {
        out.ImageElement_ImageElementData_Tag = "ElementDataId";
        out.ImageElement_ImageElementData_ElementDataId = d.ElementDataId_ ?? d.ElementDataId ?? null;
        out.ImageElement_ImageElementData_RawData = null;
      } else if (d.kind === "RawData" || d.Tag === "RawData") {
        out.ImageElement_ImageElementData_Tag = "RawData";
        out.ImageElement_ImageElementData_ElementDataId = null;
        out.ImageElement_ImageElementData_RawData = d.RawData_ ?? d.RawData ?? null;
      }
      break;
    }
    case "WidgetElement": {
      out.Tag = "WidgetElement";
      const w = element.WidgetElement_ || {};
      out.WidgetElement_ElementDataId = w.ElementDataId ?? null;
      out.WidgetElement_Width = w.Width ?? null;
      out.WidgetElement_Height = w.Height ?? null;
      out.WidgetElement_RawData = w.RawData ?? null;
      break;
    }
    default: {
      out.Tag = "";
    }
  }

  return out;
};
