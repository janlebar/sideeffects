import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = "/sqljs-httpvfs/sqlite.worker.js"; // Ensure this file exists
const wasmUrl = "/sqljs-httpvfs/sql-wasm.wasm"; // Ensure this file exists

const worker = createDbWorker(
  [
    {
      from: "jsonconfig",
      configUrl: "/sqljs-httpvfs/dbconfig.json", // ✅ You need to provide a config URL
    },
  ],
  workerUrl,
  wasmUrl
);

export default worker;
