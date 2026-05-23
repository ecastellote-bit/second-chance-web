/** Token de Vercel Blob conectado al proyecto (Storage → Blob). */
export function isVercelBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

/** En Vercel el filesystem no es durable; Blob es obligatorio para uploads y perfiles. */
export function requiresVercelBlob(): boolean {
  return process.env.VERCEL === "1";
}

export function assertVercelBlobForProduction(context: string): void {
  if (requiresVercelBlob() && !isVercelBlobConfigured()) {
    throw new Error(`blob_not_configured:${context}`);
  }
}
