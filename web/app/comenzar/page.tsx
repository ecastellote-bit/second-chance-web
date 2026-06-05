"use client";

import Link from "next/link";
import { MvpPioneerBanner } from "@/components/mvp/MvpPioneerBanner";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { DIAGNOSIS_FIRST_COPY } from "@/lib/content/diagnosisFirstCopy";
import { trackObservatoryEventOnce } from "@/lib/observatory/client";
import { useEffect } from "react";

const STEPS = [
  {
    n: 1,
    title: "Invitación fundadora",
    body: "Lectura inicial, acceso a la etapa fundadora y espacio para sembrar tu proyecto.",
    href: "/fundador",
    cta: "Ver invitación",
  },
  {
    n: 2,
    title: "Lectura inicial",
    body: "Cinco pasos honestos para ordenar tu historia antes de entrar al barrio.",
    href: "/full?founder=1",
    cta: "Hacer mi lectura",
  },
  {
    n: 3,
    title: "Temáticas",
    body: "Confirmá o afiná lo que la lectura (o tu intuición) ya sugirió.",
    href: "/tematicas",
    cta: "Ver temáticas",
  },
  {
    n: 4,
    title: "Activación",
    body: "Elegí una forma de empezar en el barrio: cinco caminos de activación.",
    href: "/activacion",
    cta: "Elegir camino",
  },
  {
    n: 5,
    title: "Tu plaza",
    body: "Centro del barrio: mapa, compromiso y puertas comunitarias.",
    href: "/plaza",
    cta: "Ir a la plaza",
  },
] as const;

export default function ComenzarPage() {
  useEffect(() => {
    trackObservatoryEventOnce("funnel.comenzar_view", "funnel");
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)] pb-24">
      <header className="px-5 pt-12 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
          Recorrido inicial
        </p>
        <h1 className="mt-2 text-[1.6rem] font-bold leading-tight text-[#0B2E59]">
          Comenzar en VocationUp
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6B7A8C]">
          {DIAGNOSIS_FIRST_COPY.rector} Camino sugerido para la ola fundadora.
        </p>
      </header>

      <MvpPioneerBanner />

      <ol className="flex flex-col gap-3 px-4 mt-2">
        {STEPS.map((step) => (
          <li key={step.n}>
            <Link
              href={step.href}
              className="vu-focus flex gap-4 rounded-[20px] border border-[#E8EEF3] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)] active:scale-[0.99]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B2E59] text-sm font-bold text-white">
                {step.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-[#0B2E59]">{step.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C]">{step.body}</p>
                <span className="mt-2 inline-block text-[12px] font-semibold text-[#1A9BB0]">
                  {step.cta} →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mx-4 mt-6 rounded-2xl border border-dashed border-[#CBD5E1] bg-white/80 p-4">
        <p className="text-[13px] font-semibold text-[#0B2E59]">¿Querés mirar el barrio antes?</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#6B7A8C]">
          Podés explorarlo, pero te recomendamos la lectura inicial para orientarte mejor.
        </p>
        <Link
          href="/plaza"
          className="vu-focus mt-3 inline-block text-[13px] font-semibold text-[#6B7A8C] underline"
        >
          {DIAGNOSIS_FIRST_COPY.secondaryCta}
        </Link>
        <Link
          href="/onboarding"
          className="vu-focus mt-2 block text-[12px] font-medium text-[#6B7A8C] underline"
        >
          Elegir puerta de entrada (alternativa)
        </Link>
      </div>

      <VuBottomNav active="plaza" />
    </div>
  );
}
