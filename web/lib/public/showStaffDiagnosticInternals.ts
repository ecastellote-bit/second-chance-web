/**
 * Laboratorio / staff: bloques de motores y jueces en /full/result.
 * En producción nunca se muestran; en desarrollo solo con ?debug=1.
 */
export function shouldShowStaffDiagnosticInternals(
  debugParam: string | null | undefined,
): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const value = debugParam?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}
