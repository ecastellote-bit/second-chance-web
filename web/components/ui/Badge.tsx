import type { ReactNode } from "react";

type BadgeVariant = "default" | "lime" | "teal" | "navy";

const variants: Record<BadgeVariant, string> = {
  default: "bg-vu-sky text-vu-graphite-muted border-vu-border",
  lime: "bg-vu-lime text-vu-navy border-vu-lime",
  teal: "bg-vu-teal/15 text-vu-teal border-vu-teal/30",
  navy: "bg-vu-navy/10 text-vu-navy border-vu-navy/20",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={[
        "inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-vu-sm border min-h-[28px]",
        variants[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
