import type { OfficialActivationPathId } from "@/lib/content/officialActivationPaths";
import { activationPathCtaHref } from "./activationPathRoutes";
import {
  appendCommunityActivity,
  appendCommunityMessage,
} from "./communityStore";

export { activationPathCtaHref } from "./activationPathRoutes";

export async function recordProjectSeeded(input: {
  userId: string;
  archiveId?: string | null;
  title: string;
  seedId: string;
}): Promise<void> {
  const { userId, archiveId, title, seedId } = input;
  const dedupe = `project_seeded:${seedId}`;

  await appendCommunityActivity(userId, {
    archiveId: archiveId ?? null,
    type: "project_seeded",
    title: "Sembraste un proyecto",
    body: `Tu proyecto «${title}» quedó guardado como semilla de la ola fundadora.`,
    ctaLabel: "Ver mi semilla",
    ctaHref: `/proyectos/semilla/${seedId}`,
    source: "user_action",
    status: "pending_review",
    dedupeKey: dedupe,
    meta: { seedId, title },
  });

  await appendCommunityMessage(userId, {
    archiveId: archiveId ?? null,
    from: "VocationUp",
    subject: "Recibimos tu proyecto",
    body: "Tu semilla quedó guardada. En esta primera etapa, el equipo fundador revisará los proyectos para darles visibilidad cuidada dentro del barrio.",
    ctaLabel: "Ver estado de mi semilla",
    ctaHref: `/proyectos/semilla/${seedId}`,
    status: "unread",
    kind: "project_received",
    dedupeKey: `msg_${dedupe}`,
    meta: { seedId, title },
  });
}

export async function recordActivationSelected(input: {
  userId: string;
  archiveId?: string | null;
  pathId: OfficialActivationPathId;
  pathLabel: string;
}): Promise<void> {
  const { userId, archiveId, pathId, pathLabel } = input;
  const dedupe = `activation_selected:${pathId}`;

  await appendCommunityActivity(userId, {
    archiveId: archiveId ?? null,
    type: "activation_selected",
    title: "Elegiste cómo empezar",
    body: `Elegiste: ${pathLabel}. Este movimiento nos ayuda a ordenar qué mostrarte primero dentro del barrio.`,
    ctaLabel: "Seguir en el barrio",
    ctaHref: activationPathCtaHref(pathId),
    source: "user_action",
    status: "visible",
    dedupeKey: dedupe,
    meta: { pathId },
  });
}

export async function recordCircleInterest(input: {
  userId: string;
  archiveId?: string | null;
  circleId: string;
  circleTitle: string;
  mode: "saved" | "interested" | "notify";
}): Promise<void> {
  const { userId, archiveId, circleId, circleTitle, mode } = input;
  const type = "circle_saved";
  const dedupe = `circle_${mode}:${circleId}`;
  const title =
    mode === "saved"
      ? "Guardaste un círculo"
      : mode === "notify"
        ? "Pediste aviso de movimiento"
        : "Te interesa este espacio";
  const body =
    mode === "saved"
      ? `Guardaste «${circleTitle}» para volver cuando quieras.`
      : mode === "notify"
        ? `Te avisaremos si «${circleTitle}» empieza a moverse.`
        : `Registramos tu interés en «${circleTitle}».`;

  const circleHref = `/circulos/${encodeURIComponent(circleId)}`;

  await appendCommunityActivity(userId, {
    archiveId: archiveId ?? null,
    type,
    title,
    body,
    ctaLabel: "Ver círculo",
    ctaHref: circleHref,
    source: "user_action",
    status: "visible",
    dedupeKey: dedupe,
    meta: { circleId, mode },
  });

  await appendCommunityMessage(userId, {
    archiveId: archiveId ?? null,
    from: "Sistema",
    subject: "Interés registrado",
    body: "Interés registrado. Si este espacio empieza a moverse o aparece una oportunidad compatible, lo vas a ver en Actividad.",
    ctaLabel: "Ver círculo",
    ctaHref: circleHref,
    status: "unread",
    kind: "interest_confirmation",
    dedupeKey: `msg_${dedupe}`,
    meta: { circleId, mode },
  });
}

export async function recordProjectInterest(input: {
  userId: string;
  archiveId?: string | null;
  projectId: string;
  projectTitle: string;
  mode: "interest" | "observe" | "join";
}): Promise<void> {
  const { userId, archiveId, projectId, projectTitle, mode } = input;
  const dedupe = `project_interest:${mode}:${projectId}`;
  const labels = {
    interest: "Me interesa",
    observe: "Quiero observar",
    join: "Quiero sumarme",
  };

  const projectHref = `/proyectos/${encodeURIComponent(projectId)}`;

  await appendCommunityActivity(userId, {
    archiveId: archiveId ?? null,
    type: "project_interest",
    title: `${labels[mode]} — ${projectTitle}`,
    body: "Registramos tu señal. No prometemos contacto inmediato: si el proyecto se mueve o encaja con vos, lo verás en Actividad.",
    ctaLabel: "Ver proyecto",
    ctaHref: projectHref,
    source: "user_action",
    status: "visible",
    dedupeKey: dedupe,
    meta: { projectId, mode },
  });

  await appendCommunityMessage(userId, {
    archiveId: archiveId ?? null,
    from: "Sistema",
    subject: "Interés registrado",
    body: "Interés registrado. Si este espacio empieza a moverse o aparece una oportunidad compatible, lo vas a ver en Actividad.",
    ctaLabel: "Ver proyecto",
    ctaHref: projectHref,
    status: "unread",
    kind: "interest_confirmation",
    dedupeKey: `msg_${dedupe}`,
    meta: { projectId, mode },
  });
}

export async function recordFormationOrEventInterest(input: {
  userId: string;
  archiveId?: string | null;
  targetId: string;
  targetTitle: string;
  targetKind: "formation" | "event";
  notifySimilar?: boolean;
  savedRoute?: boolean;
}): Promise<void> {
  const { userId, archiveId, targetId, targetTitle, targetKind, notifySimilar, savedRoute } =
    input;
  const type = targetKind === "formation" ? "formation_interest" : "event_interest";
  const dedupe = savedRoute
    ? `${type}:saved:${targetId}`
    : notifySimilar
      ? `${type}:notify:${targetId}`
      : `${type}:${targetId}`;
  const targetHref = `/eventos/${encodeURIComponent(targetId)}`;
  const listHref = targetKind === "formation" ? "/formacion" : "/eventos";

  await appendCommunityActivity(userId, {
    archiveId: archiveId ?? null,
    type,
    title: savedRoute
      ? "Guardaste una ruta"
      : notifySimilar
        ? "Aviso registrado"
        : "Interés registrado",
    body: savedRoute
      ? `Guardaste «${targetTitle}» para retomarla cuando quieras.`
      : notifySimilar
        ? `Te avisaremos si aparece algo parecido a «${targetTitle}».`
        : `Registramos tu interés en «${targetTitle}».`,
    ctaLabel: targetKind === "formation" ? "Ver formación" : "Ver evento",
    ctaHref: targetHref,
    source: "user_action",
    status: "visible",
    dedupeKey: dedupe,
    meta: { targetId, targetKind, notifySimilar: notifySimilar ? "1" : "0" },
  });

  await appendCommunityMessage(userId, {
    archiveId: archiveId ?? null,
    from: "Sistema",
    subject: "Interés registrado",
    body: "Interés registrado. Si este espacio empieza a moverse o aparece una oportunidad compatible, lo vas a ver en Actividad.",
    ctaLabel: savedRoute || notifySimilar ? (targetKind === "formation" ? "Ver formación" : "Ver eventos") : (targetKind === "formation" ? "Ver formación" : "Ver evento"),
    ctaHref: savedRoute || notifySimilar ? listHref : targetHref,
    status: "unread",
    kind: "interest_confirmation",
    dedupeKey: `msg_${dedupe}`,
    meta: {
      targetId,
      targetKind,
      notifySimilar: notifySimilar ? "1" : "0",
      savedRoute: savedRoute ? "1" : "0",
    },
  });
}
