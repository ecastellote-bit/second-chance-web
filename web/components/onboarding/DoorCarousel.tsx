"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type TouchEvent } from "react";
import type { VuDoorId } from "@/lib/design/tokens";
import { trackObservatoryEvent } from "@/lib/observatory/client";

type DoorSlide = {
  id: VuDoorId;
  title: string;
  subtitle: string;
  image: string;
  accent: string;
  accentGlow: string;
  route: string;
  Icon: () => React.ReactNode;
};

function IconCompass() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7l1.5 4.5L18 13l-4.5 1.5L12 19l-1.5-4.5L6 13l4.5-1.5L12 7z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2c1.5 3 2 5.5 2 8a6 6 0 01-4 5.7V19l-2 3-2-3v-3.3A6 6 0 016 10c0-2.5.5-5 2-8 2 1 3 2.5 4 4 4s2-3 4-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20c0-3 2.2-5 5-5s5 2 5 5M14 20c0-2 1.5-3.5 3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const SLIDES: DoorSlide[] = [
  {
    id: "entender_camino",
    title: "Quiero entender mi camino",
    subtitle: "Formación, claridad y dirección a tu ritmo",
    image: "/vu/puerta-entender-camino.png",
    accent: "#0B2E59",
    accentGlow: "rgba(11, 46, 89, 0.35)",
    route: "/community/entender_camino",
    Icon: IconCompass,
  },
  {
    id: "proximo_movimiento",
    title: "Quiero encontrar mi próximo movimiento",
    subtitle: "Proyectos, oportunidades y pasos concretos",
    image: "/vu/puerta-proximo-movimiento.png",
    accent: "#1A9BB0",
    accentGlow: "rgba(26, 155, 176, 0.35)",
    route: "/community/proximo_movimiento",
    Icon: IconRocket,
  },
  {
    id: "conectar_con_otros",
    title: "Quiero volver a conectar con otros",
    subtitle: "Círculos, encuentros y comunidad real",
    image: "/vu/puerta-conectar-otros.png",
    accent: "#C6D92D",
    accentGlow: "rgba(198, 217, 45, 0.4)",
    route: "/community/conectar_con_otros",
    Icon: IconPeople,
  },
];

export function DoorCarousel() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const slide = SLIDES[index];
  const SlideIcon = slide.Icon;

  const goTo = useCallback((next: number) => {
    setIndex((i) => (next + SLIDES.length) % SLIDES.length);
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 48) {
      setIndex((i) => {
        const next = delta > 0 ? i + 1 : i - 1;
        return (next + SLIDES.length) % SLIDES.length;
      });
    }
    touchStartX.current = null;
  };

  const enterDoor = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vu_onboarding_door", slide.id);
    }
    trackObservatoryEvent("funnel.onboarding_door", "funnel", { doorId: slide.id });
    router.push(slide.route);
  };

  return (
    <div
      className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="shrink-0 px-6 pt-10 pb-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1A9BB0]">
          VocationUp
        </p>
        <p className="mt-1 text-xs text-[#6B7A8C]">by Second Chance</p>
        <h1 className="mt-5 text-[1.35rem] font-bold leading-snug tracking-tight text-[#0B2E59] px-2">
          Elegí por dónde querés entrar
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C] max-w-xs mx-auto">
          No es un menú. Es un barrio: cada puerta es un camino distinto.
        </p>
      </header>

      <div className="relative flex flex-1 flex-col justify-center px-5 pb-4 min-h-0">
        <button
          type="button"
          aria-label="Puerta anterior"
          onClick={() => goTo(index - 1)}
          className="vu-focus absolute left-1 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#0B2E59] text-xl shadow-[0_4px_16px_rgba(15,42,70,0.08)] backdrop-blur-sm"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Puerta siguiente"
          onClick={() => goTo(index + 1)}
          className="vu-focus absolute right-1 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#0B2E59] text-xl shadow-[0_4px_16px_rgba(15,42,70,0.08)] backdrop-blur-sm"
        >
          ›
        </button>

        <article className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[28px] bg-white shadow-[0_8px_32px_rgba(11,46,89,0.12)]">
          <button type="button" onClick={enterDoor} className="vu-focus block w-full text-left">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 420px) 100vw, 340px"
                priority={index === 0}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${slide.accentGlow} 0%, transparent 35%, rgba(0,0,0,0.45) 100%)`,
                }}
              />
              <span
                className={`absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${
                  slide.id === "conectar_con_otros" ? "text-[#0B2E59]" : "text-white"
                }`}
                style={{ backgroundColor: slide.accent }}
              >
                <SlideIcon />
              </span>
            </div>

            <div className="relative -mt-6 mx-4 mb-4 rounded-[20px] bg-white px-5 py-5 shadow-[0_4px_20px_rgba(15,42,70,0.1)]">
              <p
                className="text-lg font-bold leading-snug tracking-tight"
                style={{ color: slide.accent }}
              >
                {slide.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">{slide.subtitle}</p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A9BB0]">
                Entrar por esta puerta
                <span aria-hidden>→</span>
              </p>
            </div>
          </button>
        </article>
      </div>

      <footer className="shrink-0 px-6 pb-10 pt-2 space-y-5">
        <div className="flex justify-center gap-2" role="tablist" aria-label="Puertas">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Puerta ${i + 1}: ${s.title}`}
              onClick={() => setIndex(i)}
              className={[
                "vu-focus h-2.5 rounded-full transition-all duration-300 min-w-[10px]",
                i === index ? "w-8 bg-[#1A9BB0]" : "w-2.5 bg-[#E8EEF3]",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium text-[#6B7A8C] flex items-center gap-2">
            <span className="animate-pulse">Deslizá</span>
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1A9BB0]/30 text-[#1A9BB0] text-xs"
              aria-hidden
            >
              ↔
            </span>
          </p>
          <p className="text-xs text-[#6B7A8C]">o usá las flechas para ver las otras puertas</p>
        </div>

        <Link
          href="/activacion"
          className="vu-focus flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#0B2E59] text-sm font-bold text-white"
        >
          Elegir un camino de activación
        </Link>
        <button
          type="button"
          onClick={() => router.push("/full/step-1")}
          className="vu-focus w-full text-center text-sm font-medium text-[#6B7A8C] underline-offset-2 hover:underline min-h-[44px]"
        >
          Todavía no tengo claro — empezar por el diagnóstico
        </button>
      </footer>
    </div>
  );
}
