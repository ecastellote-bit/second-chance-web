"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMMUNITY_NAV } from "@/lib/content/circulosCatalog";

function NavIcon({ icon }: { icon: (typeof COMMUNITY_NAV)[number]["icon"] }) {
  const cls = "h-5 w-5 shrink-0";
  switch (icon) {
    case "plaza":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V11z" />
        </svg>
      );
    case "circulos":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M4 20c0-3 2-5 5-5M14 18c0-2 1.5-3.5 3-3.5" />
        </svg>
      );
    case "proyectos":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7h5l2-3h4l2 3h5v12H3V7z" />
        </svg>
      );
    case "formacion":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19h16M6 16V8l6-4 6 4v8" />
        </svg>
      );
    case "oportunidades":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l2 7h7l-5.5 4 2 7L12 17l-5.5 4 2-7L3 9h7l2-7z" />
        </svg>
      );
    case "eventos":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 3v4M16 3v4M4 11h16" />
        </svg>
      );
    default:
      return null;
  }
}

export function CirculosLeftNav({ activeId = "circulos" }: { activeId?: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-[220px] lg:shrink-0 lg:flex-col lg:border-r lg:border-[#E8EEF3] lg:bg-white lg:px-3 lg:py-6">
      <Link href="/plaza" className="vu-focus mb-6 flex items-center gap-2 rounded-xl px-3 py-2">
        <svg width={32} height={32} viewBox="0 0 48 48" fill="none" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#0B2E59" />
          <path d="M16 28 L24 14 L32 28 Z" fill="#1A9BB0" />
          <path d="M20 28 L24 20 L28 28 Z" fill="#C6D92D" />
        </svg>
        <div>
          <p className="text-sm font-bold text-[#0B2E59]">VocationUp</p>
          <p className="text-[10px] text-[#6B7A8C]">Tu barrio</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-0.5" aria-label="Comunidad">
        {COMMUNITY_NAV.map((item) => {
          const isActive =
            item.id === activeId ||
            pathname === item.href ||
            (item.id === "circulos" && pathname.startsWith("/circulos")) ||
            (item.id === "eventos" && pathname.startsWith("/eventos")) ||
            (item.id === "proyectos" && pathname.startsWith("/proyectos")) ||
            (item.id === "oportunidades" && pathname.startsWith("/eventos")) ||
            (item.id === "formacion" && pathname.startsWith("/formacion"));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={[
                "vu-focus flex min-h-[44px] items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-[#E6F6FA] text-[#0B2E59]"
                  : "text-[#6B7A8C] hover:bg-[#F8FAFC]",
              ].join(" ")}
            >
              <span className={isActive ? "text-[#1A9BB0]" : "text-[#6B7A8C]"}>
                <NavIcon icon={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
