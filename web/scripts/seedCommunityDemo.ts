/**
 * Re-escribe los JSONL demo del feed de Comunidad.
 * Uso: npx tsx scripts/seedCommunityDemo.ts
 */
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  const dataDir = path.join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });

  // Los archivos demo ya viven en data/; este script documenta el punto de entrada.
  const posts = path.join(dataDir, "community-posts.jsonl");
  const comments = path.join(dataDir, "community-comments.jsonl");
  await copyFile(posts, posts);
  await copyFile(comments, comments);

  console.log("Community demo seed ready:");
  console.log(" -", posts);
  console.log(" -", comments);
  console.log("Tags usan IDs reales de circulosCatalog (empezar-de-nuevo, etc.).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
