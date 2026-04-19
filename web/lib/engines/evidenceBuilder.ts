import type { UserIntake } from "../types/intake";
import type {
  EvidenceFragment,
  EvidenceTemporalWeight,
  EvidenceValence,
} from "../types/evidence";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesAny(text: string, markers: string[]): boolean {
  return markers.some((marker) => text.includes(normalizeText(marker)));
}

function detectValence(text: string): EvidenceValence | undefined {
  const normalized = normalizeText(text);

  const negativeMarkers = [
    "me frustra",
    "me duele",
    "me drena",
    "me pesa",
    "me estresa",
    "me provoca rechazo",
    "rechazo",
    "me equivoque",
    "me equivoqué",
    "deje de",
    "dejé de",
    "fui dejando",
    "abandone",
    "abandoné",
    "renuncie",
    "renuncié",
    "casi no",
    "no la despliego",
    "no lo despliego",
    "urgencias",
    "reactivo",
    "reactivas",
    "absorbida",
    "absorbido",
    "atrapada",
    "atrapado",
    "no puedo",
    "comprimido",
    "comprimida",
    "bloqueado",
    "bloqueada",
  ];

  const positiveMarkers = [
    "me gusta",
    "me gustaba",
    "me encanta",
    "me fascinaba",
    "me fascina",
    "me atrae",
    "me entusiasma",
    "rindo mejor",
    "me sale natural",
    "me energiza",
    "disfruto",
    "me reconozco",
    "se me da bien",
    "siempre volvi a",
    "siempre volví a",
  ];

  const hasNegative = includesAny(normalized, negativeMarkers);
  const hasPositive = includesAny(normalized, positiveMarkers);

  if (hasNegative && hasPositive) return "ambivalent";
  if (hasNegative) return "negative";
  if (hasPositive) return "positive";

  return undefined;
}

function detectTemporalWeight(field: string): EvidenceTemporalWeight {
  switch (field) {
    case "childhoodMemories":
    case "earlyFascinations":
      return "childhood";
    case "meaningfulSchoolSubjects":
    case "lossesOrRenunciations":
      return "past";
    case "repeatedWorkPatterns":
    case "naturalSocialRoles":
    case "additionalContext":
      return "recent";
    case "whatFeelsCompressedNow":
    case "currentSituation":
    case "transitionGoal":
      return "current";
    default:
      return "recent";
  }
}

function detectExternalRecognition(text: string): boolean {
  const normalized = normalizeText(text);

  return includesAny(normalized, [
    "me reconocen",
    "me reconocian",
    "me reconocían",
    "me buscaban",
    "me buscan",
    "me pedian",
    "me pedían",
    "me elegian",
    "me elegían",
    "me valoraban",
    "me valoran",
    "la gente venia a mi",
    "la gente venía a mí",
    "me consultaban",
    "me llamaban para",
  ]);
}

function detectSacrificedFor(field: string, text: string): boolean {
  const normalized = normalizeText(text);

  if (field === "lossesOrRenunciations") return true;

  return includesAny(normalized, [
    "deje de",
    "dejé de",
    "fui dejando",
    "casi no",
    "no la despliego",
    "no lo despliego",
    "quedo tapada",
    "quedó tapada",
    "quedo tapado",
    "quedó tapado",
    "absorbid",
    "urgencias",
    "reactivo",
    "reactivas",
    "comprimido",
    "comprimida",
    "bloqueado",
    "bloqueada",
    "por sostener",
    "por necesidad",
  ]);
}

function detectRepetition(text: string): number {
  const normalized = normalizeText(text);

  if (
    includesAny(normalized, [
      "siempre",
      "una y otra vez",
      "repetidamente",
      "cada vez",
      "vuelvo a",
      "volvia a",
      "volvía a",
    ])
  ) {
    return 2;
  }

  return 1;
}

function buildFragment(
  id: string,
  text: string,
  field: string,
  source: "intake" | "cvme" | "followup" = "intake",
): EvidenceFragment | null {
  const clean = text.trim();
  if (!clean) return null;

  const externalRecognition = detectExternalRecognition(clean);
  const sacrificedFor = detectSacrificedFor(field, clean);

  return {
    id,
    source,
    text: clean,
    tags: [field],
    temporalWeight: detectTemporalWeight(field),
    valence: detectValence(clean),
    intensity:
      clean.length > 220 || sacrificedFor || externalRecognition
        ? 3
        : clean.length > 110
          ? 2
          : 1,
    repetition: detectRepetition(clean),
    externalRecognition,
    sacrificedFor,
  };
}

export function buildEvidenceFragmentsFromIntake(
  intake: UserIntake,
): EvidenceFragment[] {
  const fragments: Array<EvidenceFragment | null> = [
    buildFragment(
      "current-situation",
      intake.currentContext.currentSituation ?? "",
      "currentSituation",
    ),
    buildFragment(
      "transition-goal",
      intake.currentContext.transitionGoal ?? "",
      "transitionGoal",
    ),
    buildFragment(
      "childhood-memories",
      intake.narrative.childhoodMemories ?? "",
      "childhoodMemories",
    ),
    buildFragment(
      "early-fascinations",
      intake.narrative.earlyFascinations ?? "",
      "earlyFascinations",
    ),
    buildFragment(
      "meaningful-school-subjects",
      intake.narrative.meaningfulSchoolSubjects ?? "",
      "meaningfulSchoolSubjects",
    ),
    buildFragment(
      "repeated-work-patterns",
      intake.narrative.repeatedWorkPatterns ?? "",
      "repeatedWorkPatterns",
    ),
    buildFragment(
      "natural-social-roles",
      intake.narrative.naturalSocialRoles ?? "",
      "naturalSocialRoles",
    ),
    buildFragment(
      "losses-or-renunciations",
      intake.narrative.lossesOrRenunciations ?? "",
      "lossesOrRenunciations",
    ),
    buildFragment(
      "what-feels-compressed-now",
      intake.narrative.whatFeelsCompressedNow ?? "",
      "whatFeelsCompressedNow",
    ),
    buildFragment(
      "additional-context",
      intake.narrative.additionalContext ?? "",
      "additionalContext",
    ),
  ];

  return fragments.filter(
    (fragment): fragment is EvidenceFragment => fragment !== null,
  );
}