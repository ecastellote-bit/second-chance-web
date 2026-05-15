import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "navy";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
  showArrow?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-vu-teal text-white hover:bg-vu-teal-hover border border-transparent",
  secondary:
    "bg-vu-surface text-vu-teal border-2 border-vu-teal hover:bg-vu-sky",
  ghost: "bg-transparent text-vu-teal border border-transparent hover:bg-vu-sky",
  navy: "bg-vu-navy text-white hover:bg-vu-navy-hover border border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-[44px] px-4 py-2 text-sm rounded-vu-sm",
  md: "min-h-[44px] px-5 py-2.5 text-base rounded-vu-sm",
  lg: "min-h-[48px] px-7 py-3 text-base rounded-vu-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  showArrow = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        "vu-focus inline-flex items-center justify-center gap-2 font-semibold tracking-[0.2px] transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
      {showArrow ? <span aria-hidden>→</span> : null}
    </button>
  );
}
