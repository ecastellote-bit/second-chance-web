import { FOUNDER_READING_TRUST_COPY } from "@/lib/content/founderReadingTrustCopy";

type Props = {
  /** Más grande y visible — antes del CTA principal */
  prominent?: boolean;
  showFollowUp?: boolean;
};

export function FounderReadingTrustNotice({ prominent = false, showFollowUp = true }: Props) {
  const copy = FOUNDER_READING_TRUST_COPY;

  if (prominent) {
    return (
      <div
        className="rounded-2xl border-2 border-[#1A9BB0] bg-[#E6F6FA] px-5 py-5 shadow-[0_4px_20px_rgba(26,155,176,0.12)]"
        role="note"
      >
        <p className="text-[1.05rem] font-bold leading-snug text-[#0B2E59] sm:text-lg">
          {copy.headline}
        </p>
        <p className="mt-2 text-[15px] font-semibold leading-relaxed text-[#243647]">
          {copy.subline}
        </p>
        {showFollowUp ? (
          <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{copy.followUp}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-[#1A9BB0]/35 bg-[#F0FAFC] px-4 py-4"
      role="note"
    >
      <p className="text-[14px] font-bold leading-snug text-[#0B2E59]">{copy.headline}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#243647]">{copy.subline}</p>
      {showFollowUp ? (
        <p className="mt-1.5 text-[12px] leading-relaxed text-[#6B7A8C]">{copy.followUp}</p>
      ) : null}
    </div>
  );
}
