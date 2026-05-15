import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "elevated" | "muted" | "navy";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  children: ReactNode;
  interactive?: boolean;
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-vu-surface border border-vu-border shadow-vu-soft",
  elevated:
    "bg-vu-surface border border-vu-border shadow-vu-soft hover:shadow-vu-soft-hover",
  muted: "bg-vu-sky border border-vu-border",
  navy: "bg-vu-navy text-white border border-vu-navy",
};

export function Card({
  variant = "default",
  interactive,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-vu-md p-6",
        variantClasses[variant],
        interactive ? "transition-shadow cursor-pointer hover:shadow-vu-soft-hover" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
