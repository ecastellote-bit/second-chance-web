"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setActivationChoice } from "@/lib/activacion/storage";
import { mapGuidedActivationToCartel } from "@/lib/full/activationBridge";
import { useFullAnswers } from "../fullAnswersContext";

type GuidedThemeOption = {
  id: string;
  shortLabel: string;
  userFacingText: string;
  layer?: string;
  score: number;
  activationPaths: string[];
};

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

export default function ThemesPage() {
  const router = useRouter();
  const { analysis } = useFullAnswers();

  const [themes, setThemes] = useState<GuidedThemeOption[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<GuidedThemeOption | null>(null);
  const [activationDecision, setActivationDecision] = useState<ActivationDecision | null>(null);
  const [selectedActivation, setSelectedActivation] = useState<ActivationOption | null>(null);
  const [step, setStep] = useState<"themes" | "activation" | "confirmed">("themes");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!analysis.result) {
      router.replace("/full/result");
      return;
    }

    const raw = (analysis.result as unknown as Record<string, unknown>)._guidedThemes;
    if (Array.isArray(raw) && raw.length > 0) {
      setThemes(raw as GuidedThemeOption[]);
    }
  }, [analysis.result, router]);

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
      // fallback: go straight to next-step
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

  if (!analysis.result) return null;

  if (step === "confirmed") {
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
              {selectedActivation?.suggestedFirstStep ??
                "Te preparamos el siguiente paso basado en lo que elegiste."}
            </p>
          </div>

          <div className="border border-neutral-200 rounded-xl p-6 space-y-3">
            <p className="text-sm text-neutral-500">Temática elegida</p>
            <p className="text-lg font-medium">{selectedTheme?.shortLabel}</p>
            <p className="text-sm text-neutral-600">{selectedTheme?.userFacingText}</p>
          </div>

          <button
            onClick={() => {
              const path = selectedActivation?.path;
              setActivationChoice(mapGuidedActivationToCartel(path));
              router.push("/plaza");
            }}
            className="px-6 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Entrar al barrio
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
            <h1 className="text-2xl font-semibold">
              ¿Cómo querés empezar?
            </h1>
            <p className="text-sm text-neutral-700 leading-6">
              No hay una forma correcta. Elegí la que más se parezca a lo que sentís ahora.
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
          <h1 className="text-2xl font-semibold">
            ¿Qué te resuena más?
          </h1>
          <p className="text-sm text-neutral-700 leading-6">
            Basándonos en tu lectura, estas son las temáticas que más se alinean con
            lo que apareció. Elegí una — no es para siempre, es para empezar.
          </p>
        </div>

        {themes.length === 0 && (
          <div className="border border-neutral-200 rounded-xl p-6 text-center">
            <p className="text-neutral-500">Cargando temáticas...</p>
          </div>
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
              <p className="text-sm text-neutral-700 leading-6">
                {theme.userFacingText}
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push("/full/result")}
          className="text-sm text-neutral-500 underline"
        >
          Volver al resultado
        </button>
      </div>
    </main>
  );
}
