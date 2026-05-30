import Link from "next/link";
import {
  COMMUNITY_RULES_CLOSING,
  COMMUNITY_RULES_ITEMS,
  COMMUNITY_RULES_TITLE,
} from "@/lib/community/communityRulesCopy";

type Props = {
  variant?: "compact" | "full";
  className?: string;
};

export function CommunityRulesBlock({ variant = "compact", className = "" }: Props) {
  const isFull = variant === "full";

  return (
    <section
      className={[
        "rounded-[20px] border border-[#E8EEF3] bg-white p-4",
        isFull ? "shadow-sm" : "shadow-[0_4px_16px_rgba(15,42,70,0.06)]",
        className,
      ].join(" ")}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
        Cuidado comunitario
      </p>
      <h2 className="mt-1 text-[15px] font-bold text-[#0B2E59]">{COMMUNITY_RULES_TITLE}</h2>

      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-[#243647]">
        {COMMUNITY_RULES_ITEMS.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>

      <p className="mt-4 text-[13px] leading-relaxed text-[#6B7A8C] italic">
        {COMMUNITY_RULES_CLOSING}
      </p>

      {!isFull ? (
        <Link
          href="/comunidad/reglas"
          className="vu-focus mt-3 inline-block text-[12px] font-semibold text-[#1A9BB0] underline"
        >
          Ver reglas completas
        </Link>
      ) : null}
    </section>
  );
}
