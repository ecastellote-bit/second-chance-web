import type { ButtonHTMLAttributes } from "react";

type ThemePosterProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  description?: string;
  selected?: boolean;
  badge?: string;
};

/** Tarjeta temática — frase corta, bordes 24px, estilo cartel */
export function ThemePoster({
  label,
  description,
  selected,
  badge,
  className = "",
  ...props
}: ThemePosterProps) {
  return (
    <button
      type="button"
      className={[
        "vu-focus w-full text-left rounded-vu-md p-6 md:p-7 min-h-[44px] transition-all",
        "border-2 bg-vu-surface shadow-vu-soft",
        selected
          ? "border-vu-teal ring-2 ring-vu-teal/25"
          : "border-vu-border hover:border-vu-teal/50 hover:shadow-vu-soft-hover",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="vu-h2 text-vu-navy !text-xl leading-snug">{label}</p>
        {badge ? <span className="vu-badge-lime shrink-0">{badge}</span> : null}
      </div>
      {description ? (
        <p className="mt-3 vu-body text-sm">{description}</p>
      ) : null}
    </button>
  );
}

export function DoorCard({
  title,
  subtitle,
  description,
  icon,
  suggested,
  style,
  onClick,
}: {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  suggested?: boolean;
  style: { accent: string; accentSoft: string; border: string };
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "vu-focus w-full text-left rounded-vu-md p-7 md:p-8 min-h-[44px] border-2 transition-all",
        "hover:shadow-vu-soft-hover",
        suggested ? "ring-2 ring-vu-lime ring-offset-2 ring-offset-vu-mist" : "",
      ].join(" ")}
      style={{
        backgroundColor: style.accentSoft,
        borderColor: style.border,
      }}
    >
      <div className="flex items-start gap-5">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-vu-sm text-2xl"
          style={{ backgroundColor: style.accent, color: "#fff" }}
          aria-hidden
        >
          {icon}
        </span>
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="vu-h2" style={{ color: style.accent }}>
              {title}
            </h2>
            {suggested ? (
              <span className="vu-badge-lime">Sugerido para vos</span>
            ) : null}
          </div>
          <p className="text-sm font-semibold text-vu-graphite-muted">{subtitle}</p>
          <p className="vu-body text-sm">{description}</p>
        </div>
      </div>
    </button>
  );
}
