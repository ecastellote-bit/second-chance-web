import type { ReactNode } from "react";

type PageWidth = "narrow" | "default" | "wide";

const widthClasses: Record<PageWidth, string> = {
  narrow: "max-w-lg",
  default: "max-w-2xl",
  wide: "max-w-4xl",
};

export function PageShell({
  children,
  width = "default",
  className = "",
}: {
  children: ReactNode;
  width?: PageWidth;
  className?: string;
}) {
  return (
    <main
      className={`min-h-screen bg-vu-mist text-vu-graphite px-6 py-10 md:py-14 ${className}`}
    >
      <div className={`${widthClasses[width]} mx-auto space-y-10`}>{children}</div>
    </main>
  );
}
