"use client";

import { useEffect, useState } from "react";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";

type CircleSignalType =
  | "circle_interest"
  | "circle_receive_updates"
  | "circle_access_request"
  | "circle_idea";

type Props = {
  circleId: string;
  circleTitle: string;
};

const ACTIONS: { type: CircleSignalType; label: string; needsNote?: boolean }[] = [
  { type: "circle_interest", label: "Me interesa" },
  { type: "circle_receive_updates", label: "Quiero recibir movimiento" },
  { type: "circle_access_request", label: "Solicitar acceso" },
  { type: "circle_idea", label: "Tengo una idea para este círculo", needsNote: true },
];

export function CircleSignalsPanel({ circleId, circleTitle }: Props) {
  const [feedback, setFeedback] = useState("");
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [ideaText, setIdeaText] = useState("");
  const [sending, setSending] = useState<CircleSignalType | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<CircleSignalType>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const userId = getOrCreateUserId();

    async function load() {
      try {
        const res = await fetch(
          `/api/circle-signals?circleId=${encodeURIComponent(circleId)}&userId=${encodeURIComponent(userId)}`,
        );
        const data = (await res.json()) as {
          ok?: boolean;
          signals?: { signalType: CircleSignalType }[];
        };
        if (cancelled || !data.ok || !Array.isArray(data.signals)) return;
        setActiveTypes(new Set(data.signals.map((s) => s.signalType)));
      } catch {
        // ignore
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [circleId]);

  async function submit(signalType: CircleSignalType, note?: string) {
    setSending(signalType);
    setFeedback("");
    try {
      const res = await fetch("/api/circle-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getOrCreateUserId(),
          circleId,
          circleTitle,
          signalType,
          note,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        confirmation?: string;
      };
      if (!res.ok || !data.ok) {
        setFeedback(
          data.error === "blob_not_configured"
            ? "No pudimos guardar tu señal en este entorno. Probá desde la URL principal de producción."
            : data.error === "circle_idea_note_required"
              ? "Contanos tu idea en al menos 10 caracteres."
              : "No pudimos guardar la señal ahora. Probá de nuevo.",
        );
        return;
      }
      setActiveTypes((prev) => new Set([...prev, signalType]));
      setFeedback(data.confirmation ?? "Señal registrada.");
      if (signalType === "circle_idea") {
        setIdeaOpen(false);
        setIdeaText("");
      }
    } finally {
      setSending(null);
    }
  }

  return (
    <section className="w-full max-w-md rounded-2xl border border-[#E8EEF3] bg-white p-4">
      <p className="text-[13px] leading-relaxed text-[#6B7A8C]">
        Este círculo está en etapa inicial. Podés dejar una señal para que el equipo entienda qué
        ámbitos empiezan a reunir interés real.
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {ACTIONS.map((action) => {
          if (action.needsNote) {
            return (
              <div key={action.type}>
                <button
                  type="button"
                  onClick={() => setIdeaOpen((open) => !open)}
                  className="vu-focus flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#0B2E59]"
                >
                  {action.label}
                  {activeTypes.has(action.type) ? " · registrada" : ""}
                </button>
                {ideaOpen ? (
                  <div className="mt-2">
                    <textarea
                      value={ideaText}
                      onChange={(e) => setIdeaText(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Tu idea (no se publica automáticamente)"
                      className="vu-focus w-full resize-none rounded-xl border border-[#E8EEF3] px-3 py-2 text-[14px] text-[#0B2E59]"
                    />
                    <button
                      type="button"
                      disabled={sending === action.type}
                      onClick={() => submit(action.type, ideaText)}
                      className="vu-focus mt-2 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#0B2E59] text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {sending === action.type ? "Enviando…" : "Enviar idea para revisión"}
                    </button>
                  </div>
                ) : null}
              </div>
            );
          }

          const isPrimary = action.type === "circle_interest";
          return (
            <button
              key={action.type}
              type="button"
              disabled={sending === action.type}
              onClick={() => submit(action.type)}
              className={[
                "vu-focus flex min-h-[48px] w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold disabled:opacity-60",
                isPrimary
                  ? "bg-[#C6D92D] text-[#0B2E59]"
                  : "border border-[#E8EEF3] bg-white text-[#0B2E59]",
              ].join(" ")}
            >
              {sending === action.type ? "Guardando…" : action.label}
              {activeTypes.has(action.type) ? " · registrado" : ""}
            </button>
          );
        })}
      </div>

      {feedback ? (
        <p className="mt-3 text-[12px] leading-relaxed text-[#6B7A8C]">{feedback}</p>
      ) : null}
    </section>
  );
}
