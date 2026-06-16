/** Lecturas Blob en paralelo — evita listados admin secuenciales O(n) lentos. */
export async function readBlobRecordsParallel<T>(
  pathnames: string[],
  readOne: (pathname: string) => Promise<T | null>,
  concurrency = 16,
): Promise<T[]> {
  if (pathnames.length === 0) return [];

  const results: T[] = [];
  let index = 0;

  async function worker(): Promise<void> {
    while (index < pathnames.length) {
      const current = index++;
      const record = await readOne(pathnames[current]);
      if (record) results.push(record);
    }
  }

  const workers = Math.min(concurrency, pathnames.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
