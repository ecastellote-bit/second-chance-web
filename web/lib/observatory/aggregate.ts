import { getObservatoryStoreMeta } from "./store";
import type { ObservatoryEvent, ObservatoryPeriod, ObservatoryReport } from "./types";

function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function inc(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1;
}

function periodBounds(period: ObservatoryPeriod): { from: Date | null; label: string } {
  const now = new Date();
  if (period === "all") {
    return { from: null, label: "Todo el historial" };
  }
  const days = period === "7d" ? 7 : 30;
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  return { from, label: period === "7d" ? "Últimos 7 días" : "Últimos 30 días" };
}

export function filterEventsByPeriod(
  events: ObservatoryEvent[],
  period: ObservatoryPeriod,
): ObservatoryEvent[] {
  const { from } = periodBounds(period);
  if (!from) return events;
  const fromMs = from.getTime();
  return events.filter((e) => new Date(e.at).getTime() >= fromMs);
}

export function buildObservatoryReport(
  events: ObservatoryEvent[],
  period: ObservatoryPeriod,
): ObservatoryReport {
  const { from, label } = periodBounds(period);
  const filtered = filterEventsByPeriod(events, period);
  const nowIso = new Date().toISOString();
  const storeMeta = getObservatoryStoreMeta();

  const byType: Record<string, number> = {};
  const byScenario: Record<string, number> = {};
  const activacionCarteles: Record<string, number> = {};
  const onboardingDoors: Record<string, number> = {};
  const tematicas: Record<string, number> = {};
  const commitments: Record<string, number> = {};
  const diagnosticByResultType: Record<string, number> = {};
  const diagnosticByFamily: Record<string, number> = {};

  const sessions = new Set<string>();
  let humanReviewSuggested = 0;
  let compressionSignals = 0;

  let fundadorViews = 0;
  let fullReadingIntroViews = 0;
  let step1Views = 0;
  let step2Views = 0;
  let step3Views = 0;
  let step4Views = 0;
  let step5Views = 0;
  let analysisStarted = 0;
  let campaignDiagnosticArchived = 0;

  let comenzarViews = 0;
  let onboardingDoorEvents = 0;
  let tematicasSelected = 0;
  let activacionCartelesCount = 0;
  let plazaPostActivacion = 0;
  let barrioCommitments = 0;
  let diagnosticArchived = 0;

  for (const event of filtered) {
    inc(byType, event.type);
    inc(byScenario, event.scenario);
    if (event.sessionId) sessions.add(event.sessionId);

    switch (event.type) {
      case "funnel.fundador_view":
        fundadorViews += 1;
        break;
      case "funnel.full_reading_intro":
        fullReadingIntroViews += 1;
        break;
      case "funnel.full_step1_view":
        step1Views += 1;
        break;
      case "funnel.full_step2_view":
        step2Views += 1;
        break;
      case "funnel.full_step3_view":
        step3Views += 1;
        break;
      case "funnel.full_step4_view":
        step4Views += 1;
        break;
      case "funnel.full_step5_view":
        step5Views += 1;
        break;
      case "funnel.analysis_started":
        analysisStarted += 1;
        break;
      case "funnel.diagnostic_archived":
        campaignDiagnosticArchived += 1;
        diagnosticArchived += 1;
        break;
      case "funnel.comenzar_view":
        comenzarViews += 1;
        break;
      case "funnel.onboarding_door":
        onboardingDoorEvents += 1;
        if (typeof event.payload?.doorId === "string") {
          inc(onboardingDoors, event.payload.doorId);
        }
        break;
      case "funnel.tematica_selected":
        tematicasSelected += 1;
        if (typeof event.payload?.tematicaId === "string") {
          inc(tematicas, event.payload.tematicaId);
        }
        break;
      case "funnel.activacion_cartel":
        activacionCartelesCount += 1;
        if (typeof event.payload?.cartelId === "string") {
          inc(activacionCarteles, event.payload.cartelId);
        }
        break;
      case "funnel.plaza_post_activacion":
        plazaPostActivacion += 1;
        break;
      case "funnel.barrio_commitment":
        barrioCommitments += 1;
        if (typeof event.payload?.commitmentId === "string") {
          inc(commitments, event.payload.commitmentId);
        }
        break;
      case "diagnostic.case_archived":
        diagnosticArchived += 1;
        if (typeof event.payload?.resultType === "string") {
          inc(diagnosticByResultType, event.payload.resultType);
        }
        if (typeof event.payload?.primaryFamily === "string") {
          inc(diagnosticByFamily, event.payload.primaryFamily);
        }
        if (event.payload?.humanReviewSuggested === true) {
          humanReviewSuggested += 1;
        }
        if (event.payload?.compressionSignalsDetected === true) {
          compressionSignals += 1;
        }
        break;
      default:
        break;
    }
  }

  const notes: string[] = [
    "Las tasas de conversión son sobre eventos registrados, no usuarios únicos (salvo sesiones).",
    storeMeta.durable
      ? `Almacén durable activo (${storeMeta.backend}).`
      : "Desarrollo local: eventos en JSONL; en Vercel requiere BLOB_READ_WRITE_TOKEN.",
    "Pulso de campaña: fundador → lectura → pasos 1–5 → análisis → archivo.",
    "Promoción a learnedCases.ts sigue siendo manual vía /lab.",
  ];

  return {
    generatedAt: nowIso,
    period: {
      id: period,
      label,
      from: from?.toISOString() ?? null,
      to: nowIso,
    },
    store: {
      backend: storeMeta.backend,
      durable: storeMeta.durable,
    },
    totals: {
      events: filtered.length,
      uniqueSessions: sessions.size,
    },
    byType,
    byScenario,
    campaign: {
      fundadorViews,
      fullReadingIntroViews,
      step1Views,
      step2Views,
      step3Views,
      step4Views,
      step5Views,
      analysisStarted,
      diagnosticArchived: campaignDiagnosticArchived,
      fundadorToStep1Rate: rate(step1Views, fundadorViews),
      fundadorToAnalysisRate: rate(analysisStarted, fundadorViews),
      fundadorToArchivedRate: rate(campaignDiagnosticArchived, fundadorViews),
    },
    funnel: {
      comenzarViews,
      onboardingDoors: onboardingDoorEvents,
      tematicasSelected,
      activacionCarteles: activacionCartelesCount,
      plazaPostActivacion,
      barrioCommitments,
      activacionToPlazaRate: rate(plazaPostActivacion, activacionCartelesCount),
      commitmentAfterPlazaRate: rate(barrioCommitments, plazaPostActivacion),
    },
    activacionCarteles,
    onboardingDoors,
    tematicas,
    commitments,
    diagnostic: {
      archived: diagnosticArchived,
      byResultType: diagnosticByResultType,
      byPrimaryFamily: diagnosticByFamily,
      humanReviewSuggested,
      compressionSignals,
    },
    notes,
  };
}
