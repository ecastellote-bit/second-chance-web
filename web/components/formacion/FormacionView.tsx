"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PublicCommunityRecentActivity } from "@/components/community/PublicCommunityRecentActivity";
import { CommunityActionGate } from "@/components/perfil/CommunityActionGate";
import { communityActionClientError } from "@/lib/content/communityActionGateCopy";
import { CirculosLeftNav } from "@/components/circulos/CirculosLeftNav";
import { CommunityMicroAction } from "@/components/community/CommunityMicroAction";
import { EventoOpportunityCard } from "@/components/eventos/EventoOpportunityCard";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { EVENTOS_CATALOG } from "@/lib/content/eventosCatalog";
import { MICROCOPY } from "@/lib/content/neighborhoodMicrocopy";
import { getFoundingMemberArchiveId } from "@/lib/learning/foundationalMember";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";

const FORMACION_FILTER = new Set(["talleres", "charlas"]);

export function FormacionView() {
  const [suggestionText, setSuggestionText] = useState("");
  const [sendingSuggestion, setSendingSuggestion] = useState(false);
  const [suggestionFeedback, setSuggestionFeedback] = useState("");
  const routes = useMemo(
    () =>
      EVENTOS_CATALOG.filter((e) =>
        e.categories.some((c) => FORMACION_FILTER.has(c)),
      ),
    [],
  );

  async function submitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    const text = suggestionText.trim();
    if (text.length < 10) {
      setSuggestionFeedback("Por favor contanos un poco más (mínimo 10 caracteres).");
      return;
    }

    setSendingSuggestion(true);
    setSuggestionFeedback("");
    try {
      const res = await fetch("/api/formation-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getOrCreateUserId(),
          archiveId: getFoundingMemberArchiveId(),
          source: "formation_page",
          text,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        confirmation?: string;
      };
      if (!res.ok || !data.ok) {
        const gateMsg = communityActionClientError(data.error);
        setSuggestionFeedback(
          gateMsg ||
            (data.error === "blob_not_configured"
              ? "No pudimos guardar tu sugerencia en este entorno. Probá desde la URL principal de producción."
              : "No pudimos guardar la sugerencia ahora. Probá de nuevo."),
        );
        return;
      }
      setSuggestionText("");
      setSuggestionFeedback(
        data.confirmation ??
          "Tu sugerencia quedó guardada. Esto nos ayuda a buscar propuestas formativas más conectadas con lo que la comunidad necesita.",
      );
    } finally {
      setSendingSuggestion(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647] lg:flex-row">
      <CirculosLeftNav activeId="formacion" />

      <div className="flex min-h-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-[#E8EEF3] bg-[#F8FAFC] px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <Link
              href="/plaza"
              className="vu-focus flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#0B2E59]"
              aria-label="Volver a la plaza"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <p className="text-sm font-bold text-[#0B2E59]">Formación</p>
            <span className="w-11" aria-hidden />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-5 pb-8 lg:max-w-4xl lg:px-8 lg:py-8">
            <div className="mb-6 max-w-2xl">
              <p className="mb-1 hidden text-xs font-semibold uppercase tracking-wider text-[#1A9BB0] lg:block">
                Rutas de aprendizaje
              </p>
              <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59] lg:text-[1.85rem]">
                Formación en el barrio
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6B7A8C]">
                {MICROCOPY.formacion}
              </p>
              <p className="mt-3 rounded-xl border border-[#E8EEF3] bg-white px-4 py-3 text-[13px] leading-relaxed text-[#6B7A8C]">
                Estamos sembrando las primeras rutas. Podés marcar interés para que sepamos qué
                acercarte primero — sin prometer convenios ni descuentos que todavía no existen.
              </p>
            </div>

            <PublicCommunityRecentActivity className="mb-6" limit={6} />

            <CommunityActionGate returnTo="/formacion">
            <section className="mb-6 rounded-2xl border border-[#E8EEF3] bg-white p-4">
              <h2 className="text-lg font-bold text-[#0B2E59]">¿En qué te gustaría formarte?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
                Estamos construyendo el mapa formativo de VocationUp. Durante esta etapa fundadora
                vamos a recibir sugerencias y solicitar nuevas modalidades formativas a
                universidades e instituciones educativas.
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
                Contanos qué te gustaría aprender, en qué formato, para qué objetivo o qué
                institución te gustaría que participe. Te mantendremos al tanto de los avances.
              </p>
              <form onSubmit={submitSuggestion} className="mt-3">
                <textarea
                  value={suggestionText}
                  onChange={(event) => setSuggestionText(event.target.value)}
                  placeholder="Ejemplo: me gustaría formarme en comunicación digital, oficios, gestión de proyectos, programación, acompañamiento comunitario, administración, salud, educación, arte, o cualquier área que conecte con mi próximo movimiento."
                  className="min-h-[130px] w-full rounded-xl border border-[#E8EEF3] px-3 py-3 text-sm leading-relaxed text-[#243647]"
                />
                <button
                  type="submit"
                  disabled={sendingSuggestion}
                  className="vu-focus mt-3 min-h-[44px] rounded-xl bg-[#0B2E59] px-4 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {sendingSuggestion ? "Enviando…" : "Enviar sugerencia"}
                </button>
              </form>
              {suggestionFeedback ? (
                <p className="mt-3 text-[12px] leading-relaxed text-[#6B7A8C]">{suggestionFeedback}</p>
              ) : null}
              <p className="mt-3 rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#6B7A8C]">
                No implica inscripción ni reserva de cupo. Es una señal para construir futuras
                alianzas formativas.
              </p>
            </section>
            </CommunityActionGate>

            <div className="mb-4 flex flex-wrap gap-2">
              <Link
                href="/eventos"
                className="vu-focus text-sm font-semibold text-[#1A9BB0] underline"
              >
                Ver todos los eventos y oportunidades →
              </Link>
            </div>

            {routes.length === 0 ? (
              <div className="rounded-2xl border border-[#E8EEF3] bg-white p-6 text-center">
                <p className="text-sm text-[#6B7A8C]">
                  Todavía no hay rutas publicadas. Podés explorar eventos del barrio o registrar
                  interés cuando aparezca algo parecido.
                </p>
                <Link
                  href="/eventos"
                  className="vu-focus mt-4 inline-block text-sm font-semibold text-[#1A9BB0] underline"
                >
                  Ver eventos del barrio
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {routes.map((event) => (
                  <div key={event.id} className="space-y-2">
                    <EventoOpportunityCard event={event} />
                    <CommunityMicroAction
                      kind="formation_or_event"
                      targetId={event.id}
                      targetTitle={event.title}
                      targetKind="formation"
                    />
                    <CommunityMicroAction
                      kind="formation_or_event"
                      targetId={event.id}
                      targetTitle={event.title}
                      targetKind="formation"
                      notifySimilar
                    />
                    <CommunityMicroAction
                      kind="formation_or_event"
                      targetId={event.id}
                      targetTitle={event.title}
                      targetKind="formation"
                      savedRoute
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <VuBottomNav active="plaza" />
      </div>
    </div>
  );
}
