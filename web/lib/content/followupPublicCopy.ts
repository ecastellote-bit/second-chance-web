import { sanitizePublicDiagnosticCopy } from "@/lib/public/sanitizePublicDiagnosticCopy";

type FollowupOption = {
  id: string;
  label: string;
  leansToward?: string[];
};

type FollowupQuestion = {
  id: string;
  round: 2 | 3;
  ambiguityType: string;
  kind: "open_text" | "contrast_choice" | "forced_choice" | "micro_narrative";
  prompt: string;
  helpText?: string;
  options?: FollowupOption[];
};

export type FollowupPackPublic = {
  ambiguityType: string;
  round: 2 | 3;
  title: string;
  objective: string;
  questions: FollowupQuestion[];
};

const ROUND_HEADING: Record<2 | 3, string> = {
  2: "Antes de cerrar tu lectura",
  3: "Una última aclaración",
};

const PACK_COPY: Record<
  string,
  { title?: string; objective?: string }
> = {
  weak_signal_general_2: {
    title: "Necesitamos afinar un poco más la lectura",
    objective:
      "Hay señales valiosas, pero todavía falta distinguir qué aparece como fuerza propia y qué apareció por adaptación.",
  },
  weak_signal_general_3: {
    title: "Una última aclaración para no forzar una respuesta",
    objective:
      "Con una escena más concreta podemos cerrar mejor sin apurar una etiqueta.",
  },
  guide_vs_community_2: {
    title: "Antes de cerrar tu lectura, necesitamos una escena más concreta",
    objective:
      "Todavía falta separar si tu fuerza aparece más en acompañar de cerca o en sostener un espacio entre varias personas.",
  },
  guide_vs_community_3: {
    title: "Una última aclaración para no forzar una respuesta",
    objective:
      "Una pregunta breve para ver qué camino pesa más en vos, sin cerrar la lectura de golpe.",
  },
  guide_vs_connector_2: {
    title: "Antes de cerrar tu lectura, necesitamos una escena más concreta",
    objective:
      "Todavía falta separar si lo tuyo aparece más en acompañar de cerca o en coordinar partes e intereses.",
  },
  guide_vs_connector_3: {
    title: "Una última aclaración para no forzar una respuesta",
    objective:
      "Una pregunta breve para ver qué camino pesa más en vos, sin cerrar la lectura de golpe.",
  },
  strategist_vs_builder_2: {
    title: "Antes de cerrar tu lectura, necesitamos una escena más concreta",
    objective:
      "Todavía falta separar si tu aporte aparece más en leer el camino o en destrabarlo en la práctica.",
  },
  strategist_vs_builder_3: {
    title: "Una última aclaración para no forzar una respuesta",
    objective:
      "Una pregunta breve para ver qué camino pesa más en vos, sin cerrar la lectura de golpe.",
  },
  storyteller_vs_cultural_2: {
    title: "Antes de cerrar tu lectura, necesitamos una escena más concreta",
    objective:
      "Todavía falta separar si tu fuerza aparece más en explorar contextos o en darles forma y voz.",
  },
  storyteller_vs_cultural_3: {
    title: "Una última aclaración para no forzar una respuesta",
    objective:
      "Una pregunta breve para ver qué camino pesa más en vos, sin cerrar la lectura de golpe.",
  },
  connector_vs_storyteller_2: {
    title: "Antes de cerrar tu lectura, necesitamos una escena más concreta",
    objective:
      "Todavía falta separar si tu aporte aparece más en leer personas e intereses o en construir mensaje y relato.",
  },
  connector_vs_storyteller_3: {
    title: "Una última aclaración para no forzar una respuesta",
    objective:
      "Una pregunta breve para ver qué camino pesa más en vos, sin cerrar la lectura de golpe.",
  },
};

const QUESTION_PROMPT: Record<string, string> = {
  wsg_r2_q1:
    "Contá una escena reciente donde sentiste que algo de vos funcionó especialmente bien.",
  wsg_r2_q2:
    "Cuando una situación se desordena, ¿qué terminás haciendo naturalmente, aunque nadie te lo haya pedido?",
  wsg_r2_q3:
    "¿Qué problemas de otras personas te dan ganas de ayudar a resolver, y cuáles te sacan energía enseguida?",
  wsg_r2_q4:
    "¿Qué parte tuya sentís viva, pero poco usada en tu vida actual?",
  wsg_r2_q5:
    "Contá una escena concreta donde tu presencia haya cambiado algo para mejor.",
  gvcn_r2_q3: "¿En qué momento sentís que afinás mejor?",
  gvcn_r2_q4:
    "¿Qué te sale primero: entender lo que le pasa a alguien o acomodar una situación entre varias personas?",
  gvcn_r2_q5: "¿Qué te deja más sensación de aporte real?",
};

const QUESTION_OPTION_LABEL: Record<string, string> = {
  pregunta_justa: "Cuando hacés la pregunta justa a una persona",
  lectura_actores: "Cuando leés posiciones, intereses y límites entre varias partes",
  alivio_persona: "Que alguien se vaya más claro y menos solo",
  acuerdo_funcional: "Que distintas partes puedan seguir funcionando juntas",
};

const RIVALRY_BY_AMBIGUITY: Record<string, string> = {
  guide_vs_community:
    "Hoy la lectura necesita distinguir si tu fuerza aparece más en armar espacios con otros o en acompañar de cerca a alguien.",
  guide_vs_connector:
    "Necesitamos separar si lo tuyo aparece más en acompañar de cerca a alguien o en coordinar partes, intereses y acuerdos.",
  strategist_vs_builder:
    "Todavía falta separar si tu aporte aparece más en leer caminos con criterio o en hacer que algo funcione en la práctica.",
  storyteller_vs_cultural:
    "Todavía falta separar si tu fuerza aparece más en explorar contextos o en convertir experiencia en relato claro.",
  connector_vs_storyteller:
    "Todavía falta separar si tu aporte aparece más en acercar posiciones entre personas o en dar forma verbal a lo que pasa.",
  weak_signal_general:
    "Hay señales valiosas, pero todavía falta distinguir qué aparece como fuerza propia y qué apareció por adaptación.",
};

const REASON_REPLACEMENTS: [RegExp, string][] = [
  [
    /La lectura necesita una Ronda 2 para separar mejor dos direcciones posibles\.?/i,
    "Antes de cerrar tu lectura, necesitamos una escena más concreta para separar dos caminos que se parecen.",
  ],
  [
    /Una última aclaración \(Ronda 3\) ayuda a distinguir cuál pesa más, sin forzar una etiqueta cerrada\.?/i,
    "Una última aclaración para no forzar una respuesta: queremos ver qué camino pesa más en vos.",
  ],
  [
    /Necesitamos separar mejor dos direcciones posibles/i,
    "Todavía falta separar mejor dos caminos que se parecen",
  ],
  [
    /sin forzar una etiqueta cerrada/i,
    "sin apurar un cierre",
  ],
];

const PLACEHOLDERS_OPEN = [
  "No hace falta escribir perfecto. Contá la escena como te salga.",
  "Pensá en una situación real, no en una idea general.",
  "Con dos o tres párrafos alcanza si son concretos.",
];

const PLACEHOLDER_MICRO =
  "Contá una escena real: qué pasó, con quién y qué hiciste vos.";

function packKey(ambiguityType: string, round: 2 | 3): string {
  return `${ambiguityType}_${round}`;
}

export function publicRoundHeading(round: 2 | 3): string {
  return ROUND_HEADING[round];
}

export function humanizeFollowupReason(reason: string): string {
  let out = reason;
  for (const [pattern, replacement] of REASON_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return sanitizePublicDiagnosticCopy(out);
}

export function describeFollowupRivalry(input: {
  ambiguityType?: string | null;
  candidateProfiles?: string[];
}): string | null {
  if (input.ambiguityType && RIVALRY_BY_AMBIGUITY[input.ambiguityType]) {
    return RIVALRY_BY_AMBIGUITY[input.ambiguityType]!;
  }

  if (!input.candidateProfiles?.length) return null;

  const sanitized = input.candidateProfiles
    .map((p) => sanitizePublicDiagnosticCopy(p))
    .filter(Boolean);

  if (sanitized.length === 0) return null;
  if (sanitized.length === 1) {
    return `Todavía falta afinar un camino relacionado con ${sanitized[0]}.`;
  }

  return `Todavía falta separar si tu fuerza aparece más en ${sanitized[0]} o en ${sanitized[1]}.`;
}

export function placeholderForQuestion(
  kind: FollowupQuestion["kind"],
  index: number,
): string {
  if (kind === "micro_narrative") return PLACEHOLDER_MICRO;
  return PLACEHOLDERS_OPEN[index % PLACEHOLDERS_OPEN.length]!;
}

export function humanizeFollowupPack<T extends FollowupPackPublic>(pack: T): T {
  const key = packKey(pack.ambiguityType, pack.round);
  const overrides = PACK_COPY[key];

  const title =
    overrides?.title ??
    (pack.round === 2
      ? "Antes de cerrar tu lectura, necesitamos una escena más concreta"
      : "Una última aclaración para no forzar una respuesta");

  const objective =
    overrides?.objective ??
    sanitizePublicDiagnosticCopy(
      pack.objective
        .replace(/dos direcciones posibles/gi, "dos caminos que se parecen")
        .replace(/sin forzar una etiqueta cerrada/gi, "sin apurar un cierre"),
    );

  const questions = pack.questions.map((q, index) => {
    const prompt = QUESTION_PROMPT[q.id] ?? sanitizePublicDiagnosticCopy(q.prompt);
    const helpText = q.helpText
      ? sanitizePublicDiagnosticCopy(q.helpText)
      : undefined;

    const options = q.options?.map((opt) => ({
      ...opt,
      label:
        QUESTION_OPTION_LABEL[opt.id] ??
        sanitizePublicDiagnosticCopy(opt.label),
    }));

    return {
      ...q,
      prompt,
      helpText,
      options,
    };
  });

  return {
    ...pack,
    title: sanitizePublicDiagnosticCopy(title),
    objective,
    questions,
  };
}

export const FOLLOWUP_UI = {
  whyAsking: "Por qué te estamos preguntando esto",
  continue: "Actualizar mi lectura",
  continueLoading: "Procesando…",
  back: "Volver a revisar",
  errorIncomplete:
    "Todavía faltan respuestas. Completá esta ronda para afinar mejor tu lectura.",
  errorPreservation:
    "No pudimos sincronizar esta ronda. Reintentá antes de seguir.",
} as const;
