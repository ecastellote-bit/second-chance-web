import { NextResponse } from "next/server";
import { PROFILE_FAMILIES } from "@/lib/registries/profileFamilies";
import type { ProfileFamilyId } from "@/lib/types/profileFamilies";
import { toDirectoryProfileEntry } from "@/lib/users/directoryProfile";
import { listPublicProfiles } from "@/lib/users/userProfileStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAMILY_IDS = new Set<ProfileFamilyId>(
  PROFILE_FAMILIES.map((family) => family.id),
);

function parseOptionalInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.trunc(parsed);
}

function parseFamiliaParam(raw: string | null): ProfileFamilyId | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  return FAMILY_IDS.has(trimmed as ProfileFamilyId)
    ? (trimmed as ProfileFamilyId)
    : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const familiaParam = url.searchParams.get("familia") ?? url.searchParams.get("familiaVocacional");
    const familiaVocacional = parseFamiliaParam(familiaParam);

    if (familiaParam?.trim() && !familiaVocacional) {
      return NextResponse.json(
        { ok: false, error: "invalid_familia_vocacional" },
        { status: 400 },
      );
    }

    const limit = parseOptionalInt(url.searchParams.get("limit"), 24);
    const offset = parseOptionalInt(url.searchParams.get("offset"), 0);

    const result = await listPublicProfiles({
      familiaVocacional,
      country: url.searchParams.get("country"),
      city: url.searchParams.get("city"),
      buscando: url.searchParams.get("buscando"),
      query: url.searchParams.get("q") ?? url.searchParams.get("query"),
      limit,
      offset,
    });

    const profiles = result.profiles
      .map((profile) => toDirectoryProfileEntry(profile))
      .filter((profile): profile is NonNullable<typeof profile> => profile !== null);

    return NextResponse.json({
      ok: true,
      profiles,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "directory_list_failed",
      },
      { status: 500 },
    );
  }
}
