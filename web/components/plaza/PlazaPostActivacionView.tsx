"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import {
  ACTIVACION_CARTELES,
  COMMUNITY_DOORS,
  getActivacionCartel,
  type ActivacionCartelId,
  type CommunityDoor,
} from "@/lib/content/activacionCatalog";
import { CompromisoBarrioSection } from "@/components/plaza/CompromisoBarrioSection";
import { MvpPioneerBanner } from "@/components/mvp/MvpPioneerBanner";
import { PLAZA_IMAGE } from "@/lib/content/plazaPaths";
import { trackObservatoryEvent } from "@/lib/observatory/client";
import { useEffect } from "react";

function CartelIcon({ type }: { type: (typeof ACTIVACION_CARTELES)[0]["icon"] }) {
  const cls = "h-5 w-5";
  switch (type) {
    case "present":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      );
    case "associate":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M4 20c0-3 2-5 5-5s5 2 5 5" />
        </svg>
      );
    case "jobs":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16v12H4V7zM9 7V5h6v2" />
          <path d="M8 12h8" />
        </svg>
      );
    case "explore":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l2 2" />
        </svg>
      );
  }
}

function CommunityDoorCard({ door }: { door: CommunityDoor }) {
  const textOnLime = door.accent === "#C6D92D";

  return (
    <Link
      href={door.route}
      className="vu-focus group flex overflow-hidden rounded-[20px] border border-[#E8EEF3] bg-white shadow-[0_4px_20px_rgba(15,42,70,0.08)] transition-transform active:scale-[0.99]"
    >
      <div className="relative h-[88px] w-[88px] shrink-0">
        <VuWarmImage src={door.image} alt="" fill className="object-cover" sizes="88px" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${door.accent}88 0%, transparent 70%)`,
          }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-3">
        <p className="text-[13px] font-bold leading-snug text-[#0B2E59]">{door.title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[#6B7A8C]">{door.subtitle}</p>
        <p className="mt-1.5 text-[10px] leading-relaxed text-[#6B7A8C]/90 italic">{door.forWho}</p>
        <span
          className="mt-2 inline-flex w-fit items-center gap-1 text-[11px] font-semibold"
          style={{ color: textOnLime ? "#0B2E59" : door.accent }}
        >
          Entrar
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

type Props = {
  cartelId: ActivacionCartelId;
  onOpenMap: () => void;
  onChangeCartel: () => void;
};

export function PlazaPostActivacionView({ cartelId, onOpenMap, onChangeCartel }: Props) {
  const router = useRouter();
  const cartel = getActivacionCartel(cartelId);

  useEffect(() => {
    trackObservatoryEvent("funnel.plaza_post_activacion", "funnel", {
      cartelId,
    });
  }, [cartelId]);

  if (!cartel) {
    return null;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
      {/* Hero plaza */}
      <div className="relative h-[min(38vh,260px)] w-full shrink-0 overflow-hidden">
        <VuWarmImage src={PLAZA_IMAGE} alt="" fill priority className="object-cover" sizes="100vw" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,46,89,0.55) 0%, rgba(11,46,89,0.2) 50%, rgba(248,250,252,1) 100%)",
          }}
        />
        <header className="absolute left-0 right-0 top-0 z-10 px-5 pt-12 safe-top">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#C6D92D]">Second Chance</p>
          <h1
            className="mt-1 text-[1.5rem] font-bold leading-tight text-white"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.45)" }}
          >
            Tu plaza en el barrio
          </h1>
        </header>
      </div>

      <div className="relative z-10 -mt-8 flex flex-1 flex-col px-4 pb-28">
        <MvpPioneerBanner />
        {/* Cartel elegido */}
        <section className="rounded-[22px] border-2 border-[#C6D92D]/50 bg-white p-4 shadow-[0_8px_28px_rgba(15,42,70,0.1)]">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C6D92D] text-[#0B2E59]">
              <CartelIcon type={cartel.icon} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
                Tu activación
              </p>
              <p className="mt-0.5 text-[14px] font-bold leading-snug text-[#0B2E59]">{cartel.label}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{cartel.plazaWelcome}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onChangeCartel}
            className="vu-focus mt-3 text-[12px] font-semibold text-[#1A9BB0] underline"
          >
            Cambiar mi elección
          </button>
        </section>

        {/* Primer tramo */}
        <section className="mt-6">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#6B7A8C]">
            Primer tramo sugerido
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {cartel.primaryLinks.map((link) => (
              <button
                key={link.route}
                type="button"
                onClick={() => router.push(link.route)}
                className="vu-focus flex min-h-[48px] items-center justify-between rounded-2xl bg-[#0B2E59] px-4 text-left text-sm font-semibold text-white active:scale-[0.99]"
              >
                {link.label}
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        </section>

        {/* Tres puertas */}
        <section className="mt-8">
          <h2 className="text-[15px] font-bold text-[#0B2E59]">Tres formas de habitar el barrio</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C]">
            Tu activación abre un camino; las puertas siguen disponibles cuando las necesites.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {COMMUNITY_DOORS.map((door) => (
              <CommunityDoorCard key={door.id} door={door} />
            ))}
          </div>
        </section>

        <CompromisoBarrioSection />

        <button
          type="button"
          onClick={onOpenMap}
          className="vu-focus mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#E8EEF3] bg-white text-sm font-semibold text-[#0B2E59]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1A9BB0]" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          Ver mapa completo de la plaza
        </button>
      </div>

      <VuBottomNav active="plaza" />
    </div>
  );
}
