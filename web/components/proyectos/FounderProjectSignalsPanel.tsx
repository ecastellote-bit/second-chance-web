"use client";

import { useEffect, useMemo, useState } from "react";
import { postCommunityEvent } from "@/lib/community/communityClient";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";

const CAPABILITY_OPTIONS = [
  "organización",
  "comunicación",
  "investigación",
  "diseño",
  "gestión",
  "contactos",
  "experiencia vivida",
  "conocimiento técnico",
  "territorio/localidad",
  "acompañamiento",
  "tiempo disponible",
  "otra capacidad",
] as const;

type SignalType =
  | "project_follow_close"
  | "project_interest"
  | "project_possible_contribution"
  | "project_join_exploration";

type ExistingSignal = {
  signalType: SignalType;
  capabilities?: string[];
};

const SIGNAL_COPY: Record<SignalType, string> = {
  project_follow_close:
    "Tu señal quedó guardada. No implica compromiso. Si este proyecto reúne condiciones para abrir nuevos pasos, podremos avisarte.",
  project_interest:
    "Guardamos tu interés. Esto ayuda a entender qué ideas empiezan a generar movimiento dentro del barrio.",
  project_possible_contribution:
    "Tu posible aporte quedó registrado. No implica compromiso. El equipo podrá revisarlo para evaluar próximos pasos.",
  project_join_exploration:
    "Recibimos tu señal. Esto no abre contacto directo todavía. Primero se revisa si hay condiciones para una conversación cuidada.",
};

const BUTTON_LABEL: Record<SignalType, string> = {
  project_follow_close: "Seguir de cerca",
  project_interest: "Me interesa",
  project_possible_contribution: "Tal vez podría aportar",
  project_join_exploration: "Quiero explorar si puedo sumarme",
};

export function FounderProjectSignalsPanel({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  const [loadingType, setLoadingType] = useState<SignalType | null>(null);
  const [feedback, setFeedback] = useState("");
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [existingSignals, setExistingSignals] = useState<ExistingSignal[]>([]);
  const [savingCapabilities, setSavingCapabilities] = useState(false);

  useEffect(() => {
    const userId = getOrCreateUserId();
    if (!userId) return;

    fetch(
      `/api/founder-project-signals?projectId=${encodeURIComponent(projectId)}&userId=${encodeURIComponent(userId)}`,
    )
      .then((res) => res.json())
      .then((data: { ok?: boolean; signals?: ExistingSignal[] }) => {
        if (!data.ok || !Array.isArray(data.signals)) return;
        setExistingSignals(data.signals);
        const existing = data.signals.find(
          (item) => item.signalType === "project_possible_contribution",
        );
        setSelectedCapabilities(
          Array.isArray(existing?.capabilities) ? existing!.capabilities! : [],
        );
      })
      .catch(() => {});
  }, [projectId]);

  const activeTypeSet = useMemo(
    () => new Set(existingSignals.map((signal) => signal.signalType)),
    [existingSignals],
  );

  function toggleCapability(capability: string) {
    setSelectedCapabilities((current) =>
      current.includes(capability)
        ? current.filter((item) => item !== capability)
        : [...current, capability],
    );
  }

  async function sendSignal(signalType: SignalType, capabilities?: string[]) {
    setLoadingType(signalType);
    setFeedback("");
    try {
      const result = await postCommunityEvent({
        event: "founder_project_signal",
        projectId,
        projectTitle,
        signalType,
        capabilities,
        source: "project_page",
      });
      if (!result.ok) {
        setFeedback("No pudimos registrar la señal ahora. Probá de nuevo.");
        return;
      }
      setExistingSignals((current) => {
        const exists = current.some((item) => item.signalType === signalType);
        if (exists) {
          return current.map((item) =>
            item.signalType === signalType ? { ...item, capabilities } : item,
          );
        }
        return [...current, { signalType, capabilities }];
      });
      setFeedback(SIGNAL_COPY[signalType]);
    } finally {
      setLoadingType(null);
    }
  }

  async function submitPossibleContribution() {
    setSavingCapabilities(true);
    await sendSignal("project_possible_contribution", selectedCapabilities);
    setSavingCapabilities(false);
  }

  return (
    <section id="project-signals" className="mt-6 scroll-mt-4 rounded-2xl border border-[#E8EEF3] bg-white px-4 py-4">
      <h2 className="text-base font-bold text-[#0B2E59]">Dejá una señal sobre este proyecto</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
        Podés acercarte a esta idea sin asumir compromiso. Las señales ayudan al equipo a entender
        qué proyectos empiezan a reunir interés real.
      </p>
      <p className="mt-2 rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#6B7A8C]">
        Ninguna de estas acciones abre contacto directo automático ni muestra tus datos
        públicamente.
      </p>

      <div className="mt-4 space-y-2">
        {(["project_follow_close", "project_interest", "project_join_exploration"] as const).map(
          (signalType) => (
            <button
              key={signalType}
              type="button"
              disabled={loadingType !== null}
              onClick={() => void sendSignal(signalType)}
              className={[
                "vu-focus flex min-h-[44px] w-full items-center justify-center rounded-xl border px-4 text-sm font-semibold",
                activeTypeSet.has(signalType)
                  ? "border-[#1A9BB0]/40 bg-[#E6F6FA] text-[#0B2E59]"
                  : "border-[#E8EEF3] bg-white text-[#0B2E59]",
              ].join(" ")}
            >
              {loadingType === signalType
                ? "Guardando…"
                : activeTypeSet.has(signalType)
                  ? `${BUTTON_LABEL[signalType]} (registrada)`
                  : BUTTON_LABEL[signalType]}
            </button>
          ),
        )}
      </div>

      <div className="mt-4 rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-3">
        <p className="text-sm font-semibold text-[#0B2E59]">Tal vez podría aportar</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CAPABILITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleCapability(option)}
              className={[
                "rounded-full px-3 py-1.5 text-[12px] font-semibold",
                selectedCapabilities.includes(option)
                  ? "bg-[#0B2E59] text-white"
                  : "border border-[#D5DEE8] bg-white text-[#6B7A8C]",
              ].join(" ")}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void submitPossibleContribution()}
          disabled={savingCapabilities}
          className={[
            "vu-focus mt-3 min-h-[42px] rounded-xl px-4 text-sm font-semibold",
            activeTypeSet.has("project_possible_contribution")
              ? "border border-[#1A9BB0]/40 bg-[#E6F6FA] text-[#0B2E59]"
              : "bg-[#0B2E59] text-white",
          ].join(" ")}
        >
          {savingCapabilities
            ? "Guardando…"
            : activeTypeSet.has("project_possible_contribution")
              ? "Actualizar posible aporte"
              : "Registrar posible aporte"}
        </button>
      </div>

      {feedback ? <p className="mt-3 text-[12px] leading-relaxed text-[#6B7A8C]">{feedback}</p> : null}
    </section>
  );
}
