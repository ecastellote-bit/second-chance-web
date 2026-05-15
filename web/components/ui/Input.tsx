import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="grid gap-2">
      {label ? (
        <span className="text-sm font-semibold text-vu-navy">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={[
          "vu-focus w-full min-h-[44px] rounded-vu-sm border bg-vu-surface px-4 py-2.5 text-base text-vu-graphite",
          "placeholder:text-vu-graphite-subtle",
          error ? "border-red-400" : "border-vu-border focus:border-vu-teal",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error ? (
        <span className="vu-caption text-red-600">{error}</span>
      ) : hint ? (
        <span className="vu-caption">{hint}</span>
      ) : null}
    </label>
  );
}
