/**
 * Carga el seed demo de Proyectos Vivos en JSONL local.
 * Uso: npx tsx scripts/seedProyectosVivosDemo.ts
 *
 * IDs ficticios (demo-user-*). No escribe en Blob de producción.
 */
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

type DemoSeed = {
  project: Record<string, unknown>;
  roles: Array<Record<string, unknown>>;
  milestones: Array<Record<string, unknown>>;
  members: Array<Record<string, unknown>>;
};

async function appendLine(filePath: string, record: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

async function main() {
  const seedPath = path.join(
    process.cwd(),
    "data",
    "vu-proyectos-vivos-demo-seed.json",
  );
  const raw = await readFile(seedPath, "utf8");
  const seed = JSON.parse(raw) as DemoSeed;

  await appendLine(
    path.join(process.cwd(), "data", "vu-proyectos-vivos-projects.jsonl"),
    seed.project,
  );
  for (const role of seed.roles) {
    await appendLine(
      path.join(process.cwd(), "data", "vu-proyectos-vivos-roles.jsonl"),
      role,
    );
  }
  for (const milestone of seed.milestones) {
    await appendLine(
      path.join(process.cwd(), "data", "vu-proyectos-vivos-milestones.jsonl"),
      milestone,
    );
  }
  for (const member of seed.members) {
    await appendLine(
      path.join(process.cwd(), "data", "vu-proyectos-vivos-members.jsonl"),
      member,
    );
  }

  console.log("Demo seed written for Proyectos Vivos:", seed.project.slug);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
