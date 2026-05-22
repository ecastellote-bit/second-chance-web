import { HUMAN_LANGUAGE_CASES } from "./humanLanguageCases";
import { NARRATIVE_REFRACTORY_GOLDEN_IDS } from "./narrativeGoldenRefractoryCases";
import type { UserIntake } from "../types/intake";
import { buildEstefiLabPayload, ESTEFI_LAB_CASE } from "./estefiLabPayload";
import { FAIL_REF_LAB_CASES } from "./failRefLabPayloads";

export type LabCaseOption = {
  id: string;
  label: string;
  group: "golden_refractario" | "human_language";
  expectation: string;
  payload: Partial<UserIntake>;
};

function normalizeLabPayload(payload: Record<string, unknown>): Partial<UserIntake> {
  const toArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  if (payload.narrative && payload.currentContext) {
    const n = payload.narrative as Record<string, unknown>;
    const c = payload.currentContext as Record<string, unknown>;
    return {
      profile: {
        age: (payload.profile as { age?: number })?.age ?? 42,
        country: (payload.profile as { country?: string })?.country ?? "Argentina",
        language: (payload.profile as { language?: string })?.language ?? "es",
        employmentStatus: "employed",
        educationLevel:
          (payload.profile as { educationLevel?: string })?.educationLevel ?? "tertiary",
      },
      narrative: {
        childhoodMemories: String(n.childhoodMemories ?? ""),
        earlyFascinations: String(n.earlyFascinations ?? ""),
        meaningfulSchoolSubjects: String(n.meaningfulSchoolSubjects ?? ""),
        repeatedWorkPatterns: String(n.repeatedWorkPatterns ?? ""),
        naturalSocialRoles: String(n.naturalSocialRoles ?? ""),
        lossesOrRenunciations: String(n.lossesOrRenunciations ?? ""),
        whatFeelsCompressedNow: String(n.whatFeelsCompressedNow ?? ""),
        additionalContext: String(n.additionalContext ?? ""),
      },
      currentContext: {
        currentSituation: String(c.currentSituation ?? ""),
        transitionGoal: String(c.transitionGoal ?? ""),
        restrictions: toArray(c.restrictions),
        assets: toArray(c.assets),
      },
    };
  }

  if (payload.narrative && typeof payload.narrative === "object") {
    const n = payload.narrative as Record<string, unknown>;
    return {
      profile: {
        age: (payload.profile as { age?: number })?.age ?? 42,
        country: (payload.profile as { country?: string })?.country ?? "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories: String(n.childhoodMemories ?? ""),
        earlyFascinations: String(n.earlyFascinations ?? ""),
        meaningfulSchoolSubjects: String(n.meaningfulSchoolSubjects ?? ""),
        repeatedWorkPatterns: String(n.repeatedWorkPatterns ?? ""),
        naturalSocialRoles: String(n.naturalSocialRoles ?? ""),
        lossesOrRenunciations: String(n.lossesOrRenunciations ?? ""),
        whatFeelsCompressedNow: String(n.whatFeelsCompressedNow ?? ""),
        additionalContext: String(n.additionalContext ?? ""),
      },
      currentContext: {
        currentSituation: String(n.currentSituation ?? ""),
        restrictions: toArray(n.restrictions),
        assets: toArray(n.assets),
      },
    };
  }

  return payload as Partial<UserIntake>;
}

const GOLDEN_EXPECTATIONS: Record<string, string> = {
  estefi_pioneer:
    "Empathic/investigación/diplomacia postergada; admin = sostén; compresión alta; mismatch vs Artistic/Technical.",
  voc_human_01_voz_publica_encerrada:
    "Public Communicator; no Creative; frontera Public/Diplomatic aceptable.",
  voc_human_02_narrador_sin_puerta:
    "Creative Storyteller; no Public; aligned si motor acierta.",
  voc_human_03_guia_empatico_sin_cauce:
    "Empathic uno a uno; no community/diplomatic grupal.",
  fail_ref_creative_storyteller_compressed:
    "Creative + compresión; no Public por escribir.",
  fail_ref_system_designer_parches:
    "System designer; no technical_builder.",
  fail_ref_operational_organizer_burnout:
    "Operational + compresión; no clear cerrado.",
  fail_ref_empathic_guide_overload:
    "Empathic + compresión por sobreuso.",
};

/** Solo para scripts Node (lee estefi desde disco). */
export function buildGoldenRefractoryLabCases(): LabCaseOption[] {
  return NARRATIVE_REFRACTORY_GOLDEN_IDS.map((id) => {
    if (id === "estefi_pioneer") {
      return {
        id,
        label: ESTEFI_LAB_CASE.label,
        group: "golden_refractario" as const,
        expectation: GOLDEN_EXPECTATIONS[id],
        payload: buildEstefiLabPayload(),
      };
    }

    const human = HUMAN_LANGUAGE_CASES.find((c) => c.id === id);
    if (human) {
      return {
        id,
        label: `★ ${human.label}`,
        group: "golden_refractario" as const,
        expectation: GOLDEN_EXPECTATIONS[id] ?? human.expectation,
        payload: normalizeLabPayload(human.payload as Record<string, unknown>),
      };
    }

    const failRef = FAIL_REF_LAB_CASES.find((c) => c.id === id);
    return {
      id,
      label: failRef?.label ?? id,
      group: "golden_refractario" as const,
      expectation: GOLDEN_EXPECTATIONS[id] ?? failRef?.expectation ?? "",
      payload: failRef?.payload ?? {},
    };
  });
}

export { FAIL_REF_LAB_CASES, ESTEFI_LAB_CASE, buildEstefiLabPayload };

/** Todos los casos golden refractarios para /lab (client-safe). */
export function getClientGoldenRefractoryCases(): LabCaseOption[] {
  const human = HUMAN_LANGUAGE_CASES.filter((c) =>
    NARRATIVE_REFRACTORY_GOLDEN_IDS.includes(
      c.id as (typeof NARRATIVE_REFRACTORY_GOLDEN_IDS)[number],
    ),
  ).map((c) => ({
    id: c.id,
    label: `★ ${c.label}`,
    group: "golden_refractario" as const,
    expectation: GOLDEN_EXPECTATIONS[c.id] ?? c.expectation,
    payload: normalizeLabPayload(c.payload as Record<string, unknown>),
  }));

  return [
    {
      id: ESTEFI_LAB_CASE.id,
      label: ESTEFI_LAB_CASE.label,
      group: "golden_refractario" as const,
      expectation: ESTEFI_LAB_CASE.expectation,
      payload: buildEstefiLabPayload(),
    },
    ...human,
    ...FAIL_REF_LAB_CASES.map((c) => ({
      id: c.id,
      label: c.label,
      group: "golden_refractario" as const,
      expectation: c.expectation,
      payload: c.payload,
    })),
  ];
}
