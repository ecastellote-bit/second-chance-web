import {
  getOfficialActivationPath,
  type OfficialActivationPathId,
} from "@/lib/content/officialActivationPaths";

export function activationPathCtaHref(pathId: OfficialActivationPathId): string {
  const path = getOfficialActivationPath(pathId);
  return path?.primaryLinks[0]?.route ?? "/plaza";
}
