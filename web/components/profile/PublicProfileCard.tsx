import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { PublicProfileContactButton } from "@/components/profile/PublicProfileContactButton";
import { PublicProfileViewTracker } from "@/components/profile/PublicProfileViewTracker";
import { vuTokens } from "@/lib/design/tokens";
import { toPublicFamilyLabel } from "@/lib/public/humanFamilyLabel";
import { initialsFromName, type VuUserProfileRecord } from "@/lib/users/userProfileTypes";

export interface PublicProfileCardProps {
  profile: VuUserProfileRecord;
}

const DEFAULT_COVER = "/vu/llegada-silenciosa-patio.jpeg";

function locationLabel(profile: VuUserProfileRecord): string | null {
  const city = profile.city?.trim();
  const country = profile.country?.trim();
  if (city && country) return `${city}, ${country}`;
  return city || country || null;
}

function ProfileChip({
  label,
  tone,
}: {
  label: string;
  tone: "warm" | "cool";
}) {
  const classes =
    tone === "warm"
      ? "bg-amber-50 text-amber-900 ring-amber-100"
      : "bg-slate-50 text-slate-700 ring-slate-100";

  return (
    <span
      className={`inline-flex min-h-[40px] items-center rounded-full px-4 py-2 text-base font-medium ring-1 ${classes}`}
    >
      {label}
    </span>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-[#1A9BB0]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  const location = locationLabel(profile);
  const familiaLabel = toPublicFamilyLabel(profile.familiaVocacional);
  const hasAvatar = Boolean(profile.avatarUrl?.trim());
  const coverSrc = profile.coverUrl?.trim() || DEFAULT_COVER;
  const initials = initialsFromName(profile.displayName);

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] px-4 py-8 font-[family-name:var(--font-inter)] sm:px-6">
      <PublicProfileViewTracker
        profileUserId={profile.userId}
        profileSlug={profile.slug?.trim() ?? ""}
        displayName={profile.displayName.trim()}
      />
      <article className="mx-auto w-full max-w-[800px]">
        <Card variant="elevated" className="overflow-hidden p-0">
          <div className="relative h-[200px] w-full overflow-hidden rounded-t-vu-md sm:h-[220px]">
            {profile.coverUrl?.trim() ? (
              <Image
                src={coverSrc}
                alt=""
                fill
                priority
                className="object-cover object-[center_35%]"
                sizes="(max-width: 800px) 100vw, 800px"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${vuTokens.color.warningSoft} 0%, ${vuTokens.color.mist} 45%, ${vuTokens.color.sky} 100%)`,
                }}
                aria-hidden
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,46,89,0.06) 0%, rgba(11,46,89,0.28) 100%)",
              }}
              aria-hidden
            />
          </div>

          <div className="relative px-6 pb-8 pt-0 sm:px-8">
            <div className="-mt-[60px] flex flex-col items-center text-center sm:-mt-[68px]">
              {hasAvatar ? (
                <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-white bg-[#1A9BB0] shadow-[0_12px_32px_rgba(11,46,89,0.18)]">
                  <Image
                    src={profile.avatarUrl!}
                    alt={`Foto de ${profile.displayName}`}
                    fill
                    priority
                    className="object-cover object-[center_18%]"
                    sizes="120px"
                  />
                </div>
              ) : (
                <div
                  className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 border-white bg-[#1A9BB0] text-3xl font-bold text-white shadow-[0_12px_32px_rgba(11,46,89,0.18)]"
                  aria-hidden
                >
                  {initials}
                </div>
              )}

              <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#0B2E59]">
                {profile.displayName}
              </h1>

              {profile.headline?.trim() ? (
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#6B7A8C]">
                  {profile.headline.trim()}
                </p>
              ) : null}

              {profile.bio?.trim() ? (
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#243647] line-clamp-3">
                  {profile.bio.trim()}
                </p>
              ) : null}

              {familiaLabel ? (
                <p className="mt-5 inline-flex rounded-full bg-[#DFF4F7] px-5 py-2 text-base font-semibold text-[#0B2E59] ring-1 ring-[#1A9BB0]/25">
                  {familiaLabel}
                </p>
              ) : null}

              {location ? (
                <p className="mt-4 inline-flex items-center gap-2 text-lg text-[#243647]">
                  <LocationIcon />
                  <span>{location}</span>
                </p>
              ) : null}
            </div>

            <div className="mt-8 space-y-6">
              {profile.buscando.length > 0 ? (
                <section aria-labelledby="public-profile-buscando">
                  <h2
                    id="public-profile-buscando"
                    className="text-xl font-semibold text-[#0B2E59]"
                  >
                    Estoy buscando
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {profile.buscando.map((item) => (
                      <ProfileChip key={`buscando-${item}`} label={item} tone="warm" />
                    ))}
                  </div>
                </section>
              ) : null}

              {profile.aportar.length > 0 ? (
                <section aria-labelledby="public-profile-aportar">
                  <h2
                    id="public-profile-aportar"
                    className="text-xl font-semibold text-[#0B2E59]"
                  >
                    Puedo aportar
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {profile.aportar.map((item) => (
                      <ProfileChip key={`aportar-${item}`} label={item} tone="cool" />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <div className="mt-8 border-t border-[#E8EEF3] pt-6">
              <PublicProfileContactButton
                recipientId={profile.userId}
                recipientName={profile.displayName.trim()}
                recipientSlug={profile.slug?.trim() ?? ""}
              />
            </div>
          </div>
        </Card>
      </article>
    </div>
  );
}
