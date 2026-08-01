/**
 * Asigna 2 badges demo a demo-user-1 para test visual local.
 * NO ejecutar en producción.
 *
 * Uso: npx tsx scripts/seedBadgesDemo.ts
 */
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DEMO_USER_ID = "demo-user-1";

async function main() {
  const dataDir = path.join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });
  const filePath = path.join(dataDir, "vu-user-badges.jsonl");

  const now = new Date().toISOString();
  const records = [
    {
      id: `ubg_demo_primer_paso`,
      userId: DEMO_USER_ID,
      badgeSlug: "primer_paso",
      earnedAt: now,
      seen: true,
    },
    {
      id: `ubg_demo_te_presentaste`,
      userId: DEMO_USER_ID,
      badgeSlug: "te_presentaste",
      earnedAt: now,
      seen: true,
    },
  ];

  for (const record of records) {
    await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  }

  console.log("Badges demo seed written:");
  console.log(" -", filePath);
  console.log(` - userId=${DEMO_USER_ID} → primer_paso, te_presentaste`);
  console.log("Solo para test visual local. No usar en producción.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
