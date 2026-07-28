import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { getPublicSiteOrigin } from "@/lib/public/siteOrigin";
import { findUserProfileBySlug } from "@/lib/users/userProfileStore";
import { normalizeSlug } from "@/lib/users/slugUtils";
import type { VuUserProfileRecord } from "@/lib/users/userProfileTypes";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function truncateDescription(text: string, maxLength = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

function buildDescription(profile: VuUserProfileRecord): string {
  const source =
    profile.bio?.trim() ||
    profile.headline?.trim() ||
    `${profile.displayName} en VocationUp Connect`;
  return truncateDescription(source);
}

async function loadVisiblePublicProfile(
  rawSlug: string,
): Promise<VuUserProfileRecord | null> {
  const slug = normalizeSlug(rawSlug);
  if (!slug) return null;

  try {
    const profile = await findUserProfileBySlug(slug);
    if (!profile || profile.visibleEnDirectorio !== true) return null;
    return profile;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await loadVisiblePublicProfile(slug);

  if (!profile) {
    return {
      title: "Perfil no encontrado | VocationUp Connect",
      robots: { index: false, follow: false },
    };
  }

  const description = buildDescription(profile);
  const origin = getPublicSiteOrigin();
  const url = `${origin}/perfil/${profile.slug ?? normalizeSlug(slug)}`;
  const avatarUrl = profile.avatarUrl?.trim();

  return {
    title: `${profile.displayName} | VocationUp Connect`,
    description,
    openGraph: {
      type: "profile",
      url,
      title: `${profile.displayName} | VocationUp Connect`,
      description,
      siteName: "VocationUp",
      images: avatarUrl ? [{ url: avatarUrl, alt: profile.displayName }] : undefined,
    },
    alternates: { canonical: url },
  };
}

export default async function PublicProfileBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await loadVisiblePublicProfile(slug);

  if (!profile) notFound();

  return (
    <main>
      <PublicProfileCard profile={profile} />
    </main>
  );
}
