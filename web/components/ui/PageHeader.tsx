import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";

  return (
    <header className={`space-y-3 max-w-xl ${alignClass}`}>
      {eyebrow ? <p className="vu-eyebrow">{eyebrow}</p> : null}
      <h1 className="vu-h1">{title}</h1>
      {description ? <p className="vu-body">{description}</p> : null}
    </header>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h2 className={`vu-h2 ${className}`}>{children}</h2>;
}
