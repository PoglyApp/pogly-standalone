export type PragmasOptions = Partial<{
  journal_mode: "DELETE" | "WAL" | "TRUNCATE" | "PERSIST" | "MEMORY" | "OFF";
  synchronous: "OFF" | "NORMAL" | "FULL" | "EXTRA";
  foreign_keys: boolean;
  temp_store: "DEFAULT" | "FILE" | "MEMORY";
}>;