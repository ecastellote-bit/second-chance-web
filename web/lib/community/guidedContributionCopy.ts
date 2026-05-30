import type { FounderProjectGuidedContributionKind } from "@/lib/learning/founderProjectGuidedContributions";

export const GUIDED_CONTRIBUTION_KIND_OPTIONS: {
  kind: FounderProjectGuidedContributionKind;
  label: string;
}[] = [
  { kind: "valuable_part", label: "Qué parte te parece más valiosa" },
  { kind: "first_step", label: "Qué primer paso sugerirías" },
  { kind: "risk", label: "Qué riesgo ves" },
  { kind: "possible_contribution", label: "Qué podrías aportar" },
  { kind: "similar_reference", label: "Conocés algo parecido" },
];

export const GUIDED_CONTRIBUTION_VISIBLE_PREFIX: Record<
  FounderProjectGuidedContributionKind,
  string
> = {
  valuable_part: "Parte valiosa:",
  first_step: "Primer paso sugerido:",
  risk: "Riesgo señalado:",
  possible_contribution: "Aporte posible:",
  similar_reference: "Referencia similar:",
};

export const GUIDED_CONTRIBUTION_CONFIRMATION =
  "Tu aporte quedó guardado para revisión. Si se publica, aparecerá sin abrir contacto directo ni exponer tus datos personales.";
