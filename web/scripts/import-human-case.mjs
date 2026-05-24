/**
 * Importa un caso humano (.json de backup o export) al depósito en Blob.
 *
 * Uso local:
 *   node scripts/import-human-case.mjs data/learning/imports/mi-caso.json
 *
 * Producción (requiere VU_HUMAN_CASE_IMPORT_KEY en Vercel y en tu shell):
 *   node scripts/import-human-case.mjs --production mi-caso.json
 *   VU_HUMAN_CASE_IMPORT_KEY=xxx node scripts/import-human-case.mjs --url https://www.vocationup.com mi-caso.json
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");

function parseArgs(argv) {
  const flags = argv.filter((a) => a.startsWith("--"));
  const files = argv.filter((a) => !a.startsWith("--"));
  const production = flags.includes("--production");
  const urlFlag = flags.find((a) => a.startsWith("--url="));
  const baseUrl = production
    ? "https://www.vocationup.com"
    : (urlFlag?.slice("--url=".length) ?? "http://localhost:3000");
  return { baseUrl, inputPath: files[0] };
}

async function main() {
  const { baseUrl, inputPath } = parseArgs(process.argv.slice(2));

  if (!inputPath) {
    console.error(
      "Uso: node scripts/import-human-case.mjs [--production] [--url=https://...] <ruta-al-json>",
    );
    process.exit(1);
  }

  const absPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(webRoot, inputPath);

  const raw = JSON.parse(await readFile(absPath, "utf8"));
  const fromName = path.basename(absPath).match(/vocationup-caso-(.+)\.json$/i);
  const forceArchiveId = fromName?.[1]?.trim();

  const body =
    forceArchiveId && typeof raw === "object" && raw !== null
      ? { ...raw, forceArchiveId }
      : raw;

  const importKey = process.env.VU_HUMAN_CASE_IMPORT_KEY?.trim() ?? "";
  const headers = { "Content-Type": "application/json" };
  if (importKey) headers["x-vu-import-key"] = importKey;

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/human-cases/import`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Import falló:", data);
    process.exit(1);
  }

  console.log("Importado:", data);
  console.log("Ver en celular:", `${baseUrl.replace(/\/$/, "")}${data.viewUrl}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
