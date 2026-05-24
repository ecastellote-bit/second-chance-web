"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setActivationChoice } from "@/lib/activacion/storage";
import { OFFICIAL_ACTIVATION_PATHS } from "@/lib/content/officialActivationPaths";
import { mapGuidedActivationToStoredPath } from "@/lib/full/activationBridge";
import {
  resolveGuidedThemesForReading,
  type GuidedThemeOption,
} from "@/lib/full/resolveGuidedThemesForReading";
import { archivedCurrentResultToFinalReading } from "@/lib/full/restoreArchivedCaseToSession";
import { useFullAnswers } from "../fullAnswersContext";

type ActivationOption = {
  id: string;
  path: string;
  shortLabel: string;
  description: string;
  icon: "people" | "book" | "rocket" | "puzzle" | "compass";
  suggestedFirstStep: string;
};

type ActivationDecision = {
  selectedThemeId: string;
  selectedThemeLabel: string;
  availableActivations: ActivationOption[];
  diagnosticReinforcement: {
    confirmedFamilies: string[];
    confirmedAffinities: string[];
    diagnosticConfidenceBoost: number;
  };
};

const ICON_MAP: Record<string, string> = {
  people: "👥",
  book: "📚",
  rocket: "🚀",
  puzzle: "🧩",
  compass: "🧭",
};

function ThemesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const archiveId = searchParams.get("archiveId")?.trim() ?? "";
  const { analysis, setAnalysis, isHydrated } = useFullAnswers();

  const [themes, setThemes] = useState<GuidedThemeOption[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<GuidedThemeOption | null>(null);
  const [activationDecision, setActivationDecision] = useState<ActivationDecision | null>(null);
  const [selectedActivation, setSelectedActivation] = useState<ActivationOption | null>(null);
  const [step, setStep] = useState<"themes" | "activation" | "confirmed">("themes");
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(Boolean(archiveId));
  const [themesRecovery, setThemesRecovery] = useState<"idle" | "missing" | "regenerated">(
    "idle",
  );
  const [retryKey, setRetryKey] = useState(0);

  const resultBackHref = archiveId
    ? `/full/result/archivo/${encodeURIComponent(archiveId)}`
    : "/full/result";

  useEffect(() => {
    if (!isHydrated) return;

    async function ensureResult() {
      if (analysis.result) {
        setHydrating(false);
        return;
      }

      if (!archiveId) {
        router.replace("/full/result");
        return;
      }

      setHydrating(true);
      try {
        const res = await fetch(`/api/human-cases/${encodeURIComponent(archiveId)}`);
        const data = (await res.json()) as {
          ok?: boolean;
          complete?: { payload?: { currentResult?: Record<string, unknown> } };
        };
        const cr = data.complete?.payload?.currentResult;
        if (!res.ok || !data.ok || !cr) {
          router.replace("/full/result/recuperar");
          return;
        }
        setAnalysis(archivedCurrentResultToFinalReading(cr));
      } catch {
        router.replace("/full/result/recuperar");
      } finally {
        setHydrating(false);
      }
    }

    void ensureResult();
  }, [analysis.result, archiveId, isHydrated, router, setAnalysis]);

  useEffect(() => {
    if (!analysis.result) return;

    const { themes: resolved, source } = resolveGuidedThemesForReading(
      analysis.result as unknown as Record<string, unknown>,
    );

    if (resolved.length > 0) {
      setThemes(resolved);
      setThemesRecovery(source === "regenerated" ? "regenerated" : "idle");

      if (source === "regenerated" && analysis.result) {
        setAnalysis(
          {
            ...analysis.result,
            _guidedThemes: resolved,
          } as typeof analysis.result,
        );
      }
      return;
    }

    setThemes([]);
    setThemesRecovery("missing");
  }, [analysis.result, retryKey, setAnalysis]);

  async function handleThemeSelect(theme: GuidedThemeOption) {
    setSelectedTheme(theme);
    setLoading(true);

    try {
      const res = await fetch("/api/activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_activations",
          themeId: theme.id,
          matchedFamilies: [],
          matchedAffinities: [],
        }),
      });

      const data = await res.json();
      if (data.ok && data.decision) {
        setActivationDecision(data.decision);
        setStep("activation");
      }
    } catch {
      router.push("/full/next-step");
    } finally {
      setLoading(false);
    }
  }

  async function handleActivationSelect(activation: ActivationOption) {
    setSelectedActivation(activation);
    setLoading(true);

    try {
      const res = await fetch("/api/activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "choose_activation",
          themeId: selectedTheme?.id,
          activationPathId: activation.path,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setStep("confirmed");
      }
    } catch {
      setStep("confirmed");
    } finally {
      setLoading(false);
    }
  }

  if (hydrating || !analysis.result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500">
        Cargando tus temáticas…
      </main>
    );
  }

  if (step === "confirmed") {
    const activationPath = selectedActivation?.path;
    const isOwnProject = activationPath === "armar_mi_propio_proyecto";
    const officialPath = OFFICIAL_ACTIVATION_PATHS.find((p) => p.id === activationPath);

    return (
      <main className="min-h-screen bg-white text-black px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-8 text-center">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-neutral-500">
              Tu camino queda definido
            </p>
            <h1 className="text-3xl font-semibold">
              {selectedActivation?.shortLabel ?? "Listo"}
            </h1>
            <p className="text-base text-neutral-700 leading-7">
              {isOwnProject
                ? (officialPath?.plazaWelcome ??
                  "Tu camino es crear y presentar algo propio. En el siguiente paso vas a sembrar tu proyecto.")
                : (selectedActivation?.suggestedFirstStep ??
                  "Te preparamos el siguiente paso basado en lo que elegiste.")}
            </p>
          </div>

          <div className="border border-neutral-200 rounded-xl p-6 space-y-3">
            <p className="text-sm text-neutral-500">Temática elegida</p>
            <p className="text-lg font-medium">{selectedTheme?.shortLabel}</p>
            <p className="text-sm text-neutral-600">{selectedTheme?.userFacingText}</p>
          </div>

          <button
            onClick={() => {
              setActivationChoice(mapGuidedActivationToStoredPath(activationPath));
              router.push(isOwnProject ? "/proyectos/sembrar" : "/plaza");
            }}
            className="px-6 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            {isOwnProject ? "Empezar mi proyecto" : "Entrar al barrio"}
          </button>
        </div>
      </main>
    );
  }

  if (step === "activation" && activationDecision) {
    return (
      <main className="min-h-screen bg-white text-black px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wide text-neutral-500">
              Elegiste: {selectedTheme?.shortLabel}
            </p>
            <h1 className="text-2xl font-semibold">¿Cómo querés empezar?</h1>
            <p className="text-sm text-neutral-700 leading-6">
              Para esta temática, te sugerimos estas formas de empezar. Elegí la que más se
              parezca a lo que sentís ahora.
            </p>
          </div>

          <div className="space-y-4">
            {activationDecision.availableActivations.map((activation) => (
              <button
                key={activation.id}
                onClick={() => handleActivationSelect(activation)}
                disabled={loading}
                className="w-full text-left border border-neutral-200 rounded-xl p-5 space-y-2 hover:border-black hover:shadow-sm transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ICON_MAP[activation.icon] ?? "•"}</span>
                  <span className="text-lg font-medium">{activation.shortLabel}</span>
                </div>
                <p className="text-sm text-neutral-700 leading-6 pl-10">
                  {activation.description}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setStep("themes");
              setSelectedTheme(null);
              setActivationDecision(null);
            }}
            className="text-sm text-neutral-500 underline"
          >
            Volver a las temáticas
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Una lectura se convierte en camino
          </p>
          <h1 className="text-2xl font-semibold">¿Qué te resuena más?</h1>
          <p className="text-sm text-neutral-700 leading-6">
            Basándonos en tu lectura, estas son las temáticas que más se alinean con lo que
            apareció. Elegí una — no es para siempre, es para empezar.
          </p>
        </div>

        {themes.length === 0 && themesRecovery === "missing" && (
          <div className="rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] p-6 text-center space-y-4">
            <p className="text-sm leading-relaxed text-[#243647]">
              No pudimos reconstruir tus temáticas desde este archivo. Podés volver al resultado
              o regenerar esta etapa.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => router.push(resultBackHref)}
                className="rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
              >
                Volver al resultado
              </button>
              <button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                className="rounded-xl border border-[#0B2E59]/25 px-5 py-3 text-sm font-semibold text-[#0B2E59]"
              >
                Reintentar selección
              </button>
              <button
                type="button"
                onClick={() => router.push("/plaza?mapa=1")}
                className="rounded-xl border border-[#1A9BB0]/40 px-5 py-3 text-sm font-semibold text-[#0B2E59]"
              >
                Explorar la plaza
              </button>
            </div>
          </div>
        )}

        {themesRecovery === "regenerated" && themes.length > 0 && (
          <p className="rounded-xl border border-[#C6D92D]/40 bg-[#F4F9E0] px-4 py-3 text-sm text-[#243647]">
            Reconstruimos tus temáticas a partir de tu lectura archivada.
          </p>
        )}

        <div className="space-y-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              disabled={loading}
              className="w-full text-left border border-neutral-200 rounded-xl p-5 space-y-2 hover:border-black hover:shadow-sm transition-all disabled:opacity-50"
            >
              <p className="text-lg font-medium">{theme.shortLabel}</p>
              <p className="text-sm text-neutral-700 leading-6">{theme.userFacingText}</p>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push(resultBackHref)}
          className="text-sm text-neutral-500 underline"
        >
          Volver al resultado
        </button>
      </div>
    </main>
  );
}

export default function ThemesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500">
          Cargando…
        </main>
      }
    >
      <ThemesPageContent />
    </Suspense>
  );
}
