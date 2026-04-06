import type { EmployabilityDirection, ProbableProfile } from "../types/profiles";
import { getDirectionsForProfile } from "./profileDirectionMatrix";

export function runSEL(profiles: ProbableProfile[]): EmployabilityDirection[] {
  const topProfile = profiles[0];
  if (!topProfile) return [];

  return getDirectionsForProfile(topProfile.id);
}