"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BARRIO_COMMITMENT_OPTIONS,
  getBarrioCommitment,
  setBarrioCommitment,
  type BarrioCommitmentId,
} from "@/lib/activacion/commitment";
import {
  postCommunityActivity,
  postCommunityMessage,
} from "@/lib/community/communityClient";
import { trackObservatoryEvent } from "@/lib/observatory/client";

export function CompromisoBarrioSection() {
  const router = useRouter();
  const [saved, setSaved] = useState(() => getBarrioCommitment());
  const [selected, setSelected] = useState<BarrioCommitmentId | null>(saved?.id ?? null);
  const [note, setNote] = useState(saved?.note ?? "");

  if (saved) {
    const label = BARRIO_COMMITMENT_OPTIONS.find((o) => o.id === saved.id)?.label;
    return (
      <section className="mt-8 rounded-[22px] border border-[#1A9BB0]/25 bg-[#E6F6FA] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
          Tu compromiso con el barrio
        </p>
        <p className="mt-1 text-[14px] font-bold text-[#0B2E59]">{label}</p>
        {saved.note ? (
          <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{saved.note}</p>
        ) : null}
        <p className="mt-3 text-[12px] text-[#6B7A8C]">
          Quedó registrado para esta etapa fundadora. Podés ver el detalle en Actividad y Mensajes.
        </p>
        {saved.id === "crear_proyecto" ? (
          <button
            type="button"
            onClick={() => router.push("/proyectos/sembrar")}
            className="vu-focus mt-3 text-[13px] font-semibold text-[#1A9BB0] underline"
          >
            Ir a proyectos del barrio
          </button>
        ) : null}
        {saved.id === "sumarme" ? (
          <button
            type="button"
            onClick={() => router.push("/proyectos/manos-que-transforman")}
            className="vu-focus mt-3 text-[13px] font-semibold text-[#1A9BB0] underline"
          >
            Ver taller vecinal destacado
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-[15px] font-bold text-[#0B2E59]">Tu compromiso con el barrio</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C]">
        Tu participación ayuda a sembrar esta primera etapa del barrio. Elegí un paso pequeño y real.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {BARRIO_COMMITMENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelected(opt.id)}
            className={[
              "vu-focus rounded-2xl border-2 p-4 text-left transition-colors",
              selected === opt.id
                ? "border-[#C6D92D] bg-[#F4F9E0]"
                : "border-[#E8EEF3] bg-white",
            ].join(" ")}
          >
            <p className="text-[13px] font-bold text-[#0B2E59]">{opt.label}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#6B7A8C]">{opt.description}</p>
          </button>
        ))}
      </div>
      {selected ? (
        <label className="mt-4 block">
          <span className="text-[12px] font-semibold text-[#6B7A8C]">
            Opcional: una línea sobre tu idea o qué buscás
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="vu-focus mt-2 w-full resize-none rounded-xl border border-[#E8EEF3] px-3 py-2 text-[14px] text-[#0B2E59]"
            placeholder="Ej.: taller de motores los fines de semana…"
          />
        </label>
      ) : null}
      <button
        type="button"
        disabled={!selected}
        onClick={async () => {
          if (!selected) return;
          const label =
            BARRIO_COMMITMENT_OPTIONS.find((o) => o.id === selected)?.label ?? selected;
          const entry = {
            id: selected,
            at: new Date().toISOString(),
            note: note.trim() || undefined,
          };
          setBarrioCommitment(entry);
          setSaved(entry);
          trackObservatoryEvent("funnel.barrio_commitment", "funnel", {
            commitmentId: selected,
          });
          const dedupe = `barrio_commitment:${selected}`;
          await postCommunityActivity({
            type: "system_next_step",
            title: "Guardaste tu compromiso",
            body: `Registramos: ${label}. Tu compromiso quedó guardado para esta etapa fundadora.`,
            ctaLabel: "Ver mi actividad",
            ctaHref: "/actividad",
            dedupeKey: dedupe,
            meta: { commitmentId: selected },
          });
          await postCommunityMessage({
            from: "VocationUp",
            subject: "Compromiso registrado",
            body: "Tu compromiso quedó registrado para esta etapa fundadora. Lo vas a ver reflejado en Actividad.",
            kind: "next_step",
            ctaLabel: "Ver mensajes",
            ctaHref: "/mensajes",
            dedupeKey: `msg_${dedupe}`,
            meta: { commitmentId: selected },
          });
        }}
        className="vu-focus mt-4 flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#C6D92D] text-sm font-bold text-[#0B2E59] disabled:opacity-40"
      >
        Confirmar compromiso
      </button>
    </section>
  );
}
