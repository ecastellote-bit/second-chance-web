import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { vuTokens } from "@/lib/design/tokens";
import { toPublicFamilyLabel } from "@/lib/public/humanFamilyLabel";
import type { DirectoryProfileEntry } from "@/lib/users/directoryProfile";

export interface DirectoryProfileCardProps {
  profile: DirectoryProfileEntry;
}

const DEFAULT_COVER = "/vu/llegada-silenciosa-patio.jpeg";

function locationLabel(profile: DirectoryProfileEntry): string | null {
  const city = profile.city?.trim();
  const country = profile.country?.trim();
  if (city && country) return `${city}, ${country}`;
  return city || country || null;
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-[#1A9BB0]"
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

export function DirectoryProfileCard({ profile }: DirectoryProfileCardProps) {
  const location = locationLabel(profile);
  const familiaLabel = toPublicFamilyLabel(profile.familiaVocacional);
  const coverSrc = profile.coverUrl?.trim() || DEFAULT_COVER;
  const visibleBuscando = profile.buscando.slice(0, 2);
  const hiddenBuscandoCount = Math.max(profile.buscando.length - visibleBuscando.length, 0);
  const href = `/perfil/${profile.slug}`;

  return (
    <Link
      href={href}
      className="vu-focus group block h-full rounded-vu-md outline-offset-4"
      aria-label={`Ver perfil de ${profile.displayName}`}
    >
      <Card
        variant="elevated"
        className="h-full overflow-hidden p-0 transition-shadow group-hover:shadow-vu-soft-hover group-hover:ring-1 group-hover:ring-[#1A9BB0]/20"
      >
        <div className="relative h-[120px] w-full overflow-hidden">
          {profile.coverUrl?.trim() ? (
            <Image
              src={coverSrc}
              alt=""
              fill
              className="object-cover object-[center_35%]"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                "linear-gradient(180deg, rgba(11,46,89,0.04) 0%, rgba(11,46,89,0.22) 100%)",
            }}
            aria-hidden
          />
        </div>

        <div className="relative px-4 pb-5 pt-0">
          <div className="-mt-10 flex justify-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-white bg-[#1A9BB0] shadow-[0_8px_20px_rgba(11,46,89,0.15)]">
              <Image
                src={profile.avatarUrl}
                alt=""
                fill
                className="object-cover object-[center_18%]"
                sizes="80px"
              />
            </div>
          </div>

          <div className="mt-3 text-center">
            <h3 className="truncate text-xl font-semibold text-[#0B2E59]">
              {profile.displayName}
            </h3>
            {profile.headline ? (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#6B7A8C]">
                {profile.headline}
              </p>
            ) : null}

            {familiaLabel ? (
              <p className="mt-3 inline-flex rounded-full bg-[#DFF4F7] px-3 py-1 text-xs font-semibold text-[#0B2E59] ring-1 ring-[#1A9BB0]/20">
                {familiaLabel}
              </p>
            ) : null}

            {location ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#243647]">
                <LocationIcon />
                <span>{location}</span>
              </p>
            ) : null}
          </div>

          {visibleBuscando.length > 0 ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {visibleBuscando.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-100"
                >
                  {item}
                </span>
              ))}
              {hiddenBuscandoCount > 0 ? (
                <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#6B7A8C] ring-1 ring-[#E8EEF3]">
                  +{hiddenBuscandoCount}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}

export function DirectoryProfileCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-vu-md border border-[#E8EEF3] bg-white shadow-vu-soft">
      <div className="h-[120px] animate-pulse bg-[#E8EEF3]" />
      <div className="px-4 pb-5 pt-0">
        <div className="-mt-10 flex justify-center">
          <div className="h-20 w-20 animate-pulse rounded-full bg-[#CBD5E1]" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="mx-auto h-6 w-3/4 animate-pulse rounded bg-[#E8EEF3]" />
          <div className="mx-auto h-4 w-full animate-pulse rounded bg-[#F1F5F9]" />
          <div className="mx-auto h-4 w-5/6 animate-pulse rounded bg-[#F1F5F9]" />
          <div className="mx-auto h-6 w-1/2 animate-pulse rounded-full bg-[#E8EEF3]" />
        </div>
      </div>
    </div>
  );
}
