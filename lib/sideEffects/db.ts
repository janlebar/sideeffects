import { readFileSync } from "fs";
import { join } from "path";
import initSqlJs from "sql.js";

// The database ships with the app as a read-only snapshot (see plan): on Vercel
// the filesystem is read-only/ephemeral, so we only ever read from it.
//
// Both files are copied into the serverless bundle via `outputFileTracingIncludes`
// in next.config.ts, so `process.cwd()` resolves correctly in dev and on Vercel.
const DATA_DIR = join(process.cwd(), "lib", "data");
const DB_PATH = join(DATA_DIR, "medicine.db");
const WASM_PATH = join(DATA_DIR, "sql-wasm.wasm");

let mapPromise: Promise<Map<string, string>> | null = null;

async function load(): Promise<Map<string, string>> {
  const wasmBuffer = readFileSync(WASM_PATH);
  const wasmBinary = wasmBuffer.buffer.slice(
    wasmBuffer.byteOffset,
    wasmBuffer.byteOffset + wasmBuffer.byteLength
  ) as ArrayBuffer;

  const SQL = await initSqlJs({ wasmBinary });

  const fileBuffer = readFileSync(DB_PATH);
  const db = new SQL.Database(new Uint8Array(fileBuffer));

  const map = new Map<string, string>();
  const stmt = db.prepare("SELECT medicine, symptoms FROM medicine_data");
  while (stmt.step()) {
    const row = stmt.getAsObject() as { medicine?: string; symptoms?: string };
    if (row.medicine) {
      map.set(String(row.medicine).trim().toLowerCase(), String(row.symptoms ?? ""));
    }
  }
  stmt.free();
  db.close();

  return map;
}

function getMap(): Promise<Map<string, string>> {
  if (!mapPromise) {
    mapPromise = load().catch((err) => {
      // Allow a later request to retry if loading failed.
      mapPromise = null;
      throw err;
    });
  }
  return mapPromise;
}

/** Return the raw stored side-effect text for a medicine, or null if not in the snapshot. */
export async function getStoredSideEffects(
  medicine: string
): Promise<string | null> {
  const key = medicine.trim().toLowerCase();
  if (!key) return null;
  const map = await getMap();
  return map.get(key) ?? null;
}
