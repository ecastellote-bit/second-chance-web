import Link from "next/link";
import { PROFILE_FLOW_COPY } from "@/lib/content/profileFlowCopy";
import { profileSessionHrefs } from "@/lib/users/profileSessionHrefs";

type Props = {
  returnTo: string;
  title?: string;
  body?: string;
  className?: string;
  /** dense for cards; default for pages */
  density?: "default" | "compact";
};

/**
 * CTAs honestos de Connect: retomar primero, crear como alternativa, con redirect de vuelta.
 */
export function SessionContinueLinks({
  returnTo,
  title = PROFILE_FLOW_COPY.identityMissingCompact.title,
  body = PROFILE_FLOW_COPY.identityMissingCompact.body,
  className = "",
  density = "default",
}: Props) {
  const hrefs = profileSessionHrefs(returnTo);
  const compact = density === "compact";

  return (
    <div
      className={[
        compact
          ? "rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] p-3 text-left"
          : "rounded-2xl border border-[#E8EEF3] bg-white p-5 text-center shadow-sm",
        className,
      ].join(" ")}
    >
      <p
        className={
          compact
            ? "text-[13px] font-semibold text-[#0B2E59]"
            : "text-base font-bold text-[#0B2E59]"
        }
      >
        {title}
      </p>
      <p
        className={
          compact
            ? "mt-1 text-[12px] leading-relaxed text-[#6B7A8C]"
            : "mt-2 text-sm leading-relaxed text-[#6B7A8C]"
        }
      >
        {body}
      </p>
      <div
        className={
          compact
            ? "mt-2 flex flex-wrap gap-2"
            : "mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center"
        }
      >
        <Link
          href={hrefs.resume}
          className={[
            "vu-focus inline-flex items-center justify-center font-semibold text-white",
            compact
              ? "min-h-[40px] rounded-xl bg-[#0B2E59] px-3 text-[12px]"
              : "min-h-[48px] rounded-xl bg-[#0B2E59] px-5 text-sm",
          ].join(" ")}
        >
          {PROFILE_FLOW_COPY.identityMissing.ctaResume}
        </Link>
        <Link
          href={hrefs.create}
          className={[
            "vu-focus inline-flex items-center justify-center font-semibold text-[#0B2E59]",
            compact
              ? "min-h-[40px] rounded-xl border border-[#E8EEF3] bg-white px-3 text-[12px]"
              : "min-h-[48px] rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-5 text-sm",
          ].join(" ")}
        >
          {PROFILE_FLOW_COPY.identityMissing.ctaCreate}
        </Link>
      </div>
    </div>
  );
}
