import { appendCommunityActivity } from "./communityStore";

export async function recordFormationSuggestionSubmitted(input: {
  userId: string;
  archiveId?: string | null;
  suggestionId: string;
}): Promise<void> {
  const { userId, archiveId, suggestionId } = input;
  const dedupe = `formation_suggestion:${suggestionId}`;

  await appendCommunityActivity(userId, {
    archiveId: archiveId ?? null,
    type: "formation_interest",
    title: "Enviaste una sugerencia de formación",
    body: "Tu sugerencia quedó guardada. Esto nos ayuda a orientar futuras alianzas formativas.",
    ctaLabel: "Ver formación",
    ctaHref: "/formacion",
    source: "user_action",
    status: "visible",
    dedupeKey: dedupe,
    meta: { suggestionId },
  });
}
