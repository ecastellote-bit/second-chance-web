"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isFounderCommunityPreviewActive } from "@/lib/founder/communityPreviewBypass";
import { isFoundingMemberQualified } from "@/lib/learning/foundationalMember";
import { DIAGNOSIS_FIRST_COPY } from "@/lib/content/diagnosisFirstCopy";

type Variant = "dark" | "light" | "compact";

const STYLES: Record<
  Variant,
  { wrap: string; title: string; body: string; primary: string; secondary: string }
> = {
  dark: {
    wrap: "rounded-[20px] border border-[#C6D92D]/35 bg-[#0B2E59]/90 p-4 backdrop-blur-sm",
    title: "text-sm font-bold text-white",
    body: "mt-2 text-[13px] leading-relaxed text-white/90",
    primary:
      "vu-focus flex min-h-[48px] items-center justify-center rounded-2xl bg-[#C6D92D] px-4 text-sm font-bold text-[#0B2E59]",
    secondary:
      "vu-focus flex min-h-[44px] items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white",
  },
  light: {
    wrap: "rounded-[20px] border border-[#1A9BB0]/25 bg-[#E6F6FA] p-4",
    title: "text-sm font-bold text-[#0B2E59]",
    body: "mt-2 text-[13px] leading-relaxed text-[#6B7A8C]",
    primary:
      "vu-focus flex min-h-[48px] items-center justify-center rounded-2xl bg-[#0B2E59] px-4 text-sm font-bold text-white",
    secondary:
      "vu-focus flex min-h-[44px] items-center justify-center rounded-2xl border border-[#1A9BB0]/35 bg-white px-4 text-sm font-semibold text-[#0B2E59]",
  },
  compact: {
    wrap: "rounded-xl border border-[#E8EEF3] bg-white px-3 py-3",
    title: "text-[13px] font-bold text-[#0B2E59]",
    body: "mt-1 text-[12px] leading-relaxed text-[#6B7A8C]",
    primary:
      "vu-focus inline-flex min-h-[40px] items-center rounded-xl bg-[#0B2E59] px-3 text-[12px] font-bold text-white",
    secondary:
      "vu-focus inline-flex min-h-[40px] items-center rounded-xl border border-[#1A9BB0]/30 px-3 text-[12px] font-semibold text-[#0B2E59]",
  },
};

type Props = {
  variant?: Variant;
  className?: string;
  showSecondary?: boolean;
};

export function DiagnosisFirstBanner({
  variant = "light",
  className = "",
  showSecondary = true,
}: Props) {
  const [visible, setVisible] = useState(false);
  const styles = STYLES[variant];
  const copy = DIAGNOSIS_FIRST_COPY;

  useEffect(() => {
    setVisible(!isFoundingMemberQualified() && !isFounderCommunityPreviewActive());
  }, []);

  if (!visible) return null;

  return (
    <aside className={[styles.wrap, className].join(" ")} role="status">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
        Lectura fundadora
      </p>
      <p className={styles.title}>{copy.bannerTitle}</p>
      <p className={styles.body}>{copy.bannerBody}</p>
      <div
        className={[
          "mt-4 flex flex-col gap-2",
          variant === "compact" ? "sm:flex-row sm:flex-wrap" : "",
        ].join(" ")}
      >
        <Link href={copy.readingHref} className={styles.primary}>
          {copy.primaryCta}
        </Link>
        {showSecondary ? (
          <Link href={copy.exploreHref} className={styles.secondary}>
            {copy.secondaryCta}
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

/** Plaza: banner para usuarios sin lectura; enlace suave si ya la completaron. */
export function PlazaDiagnosisPrompt() {
  const [mode, setMode] = useState<"loading" | "needs" | "done">("loading");

  useEffect(() => {
    setMode(
      isFoundingMemberQualified() || isFounderCommunityPreviewActive() ? "done" : "needs",
    );
  }, []);

  if (mode === "loading") return null;
  if (mode === "needs") {
    return <DiagnosisFirstBanner variant="dark" className="mb-3" />;
  }

  return (
    <Link
      href={DIAGNOSIS_FIRST_COPY.readingHref}
      className="vu-focus mb-3 inline-flex max-w-[320px] items-center gap-1 text-[13px] font-semibold text-[#C6D92D] underline decoration-[#C6D92D]/50 underline-offset-2"
      style={{ textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}
    >
      Profundizar mi lectura →
    </Link>
  );
}
