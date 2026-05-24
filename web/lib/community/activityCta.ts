import { activationPathCtaHref } from "@/lib/community/activationPathRoutes";
import {
  getOfficialActivationPath,
  isOfficialActivationPathId,
  type OfficialActivationPathId,
} from "@/lib/content/officialActivationPaths";
import type { CommunityActivityItem, CommunityMessage } from "./types";

export type ResolvedCta = { label: string; href: string };

function metaStr(
  meta: Record<string, string | null> | null | undefined,
  key: string,
): string | null {
  const v = meta?.[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** CTA útil para tarjetas (evita “Ver mi actividad” dentro de /actividad). */
export function resolveActivityCta(item: CommunityActivityItem): ResolvedCta | null {
  const meta = item.meta;

  switch (item.type) {
    case "project_seeded": {
      const seedId = metaStr(meta, "seedId");
      if (seedId) {
        return { label: "Ver mi semilla", href: `/proyectos/semilla/${encodeURIComponent(seedId)}` };
      }
      return { label: "Ver proyectos semilla", href: "/proyectos" };
    }
    case "activation_selected": {
      const pathId = metaStr(meta, "pathId");
      if (pathId && isOfficialActivationPathId(pathId)) {
        const path = getOfficialActivationPath(pathId);
        const href = activationPathCtaHref(pathId as OfficialActivationPathId);
        return {
          label: path?.primaryLinks[0]?.label ?? "Seguir en el barrio",
          href,
        };
      }
      return { label: "Ir a la plaza", href: "/plaza" };
    }
    case "circle_saved": {
      const circleId = metaStr(meta, "circleId");
      if (circleId) {
        return { label: "Ver círculo", href: `/circulos/${encodeURIComponent(circleId)}` };
      }
      return { label: "Ver círculos", href: "/circulos" };
    }
    case "project_interest": {
      const projectId = metaStr(meta, "projectId");
      if (projectId) {
        return {
          label: "Ver proyecto",
          href: `/proyectos/${encodeURIComponent(projectId)}`,
        };
      }
      return { label: "Ver proyectos", href: "/proyectos" };
    }
    case "formation_interest": {
      const targetId = metaStr(meta, "targetId");
      if (targetId) {
        return {
          label: "Ver formación",
          href: `/eventos/${encodeURIComponent(targetId)}`,
        };
      }
      return { label: "Ver formación", href: "/formacion" };
    }
    case "event_interest": {
      const targetId = metaStr(meta, "targetId");
      if (targetId) {
        return {
          label: "Ver evento",
          href: `/eventos/${encodeURIComponent(targetId)}`,
        };
      }
      return { label: "Ver eventos", href: "/eventos" };
    }
    case "system_next_step": {
      if (item.ctaHref && item.ctaHref !== "/actividad") {
        return {
          label: item.ctaLabel?.trim() || "Siguiente paso",
          href: item.ctaHref,
        };
      }
      return { label: "Ir a la plaza", href: "/plaza" };
    }
    case "diagnostic_completed": {
      const archiveId = item.archiveId;
      if (archiveId) {
        return {
          label: "Ver tu lectura",
          href: `/full/result/archivo/${encodeURIComponent(archiveId)}`,
        };
      }
      return { label: "Ver resultado", href: "/full/result" };
    }
    case "theme_selected":
      return { label: "Ver temáticas", href: "/full/themes" };
    default:
      break;
  }

  if (item.ctaHref && item.ctaHref !== "/actividad") {
    return {
      label: item.ctaLabel?.trim() || "Continuar",
      href: item.ctaHref,
    };
  }

  return null;
}

export function resolveMessageCta(message: CommunityMessage): ResolvedCta | null {
  const meta = message.meta;

  switch (message.kind) {
    case "project_received": {
      const seedId = metaStr(meta, "seedId");
      if (seedId) {
        return {
          label: "Ver estado de mi semilla",
          href: `/proyectos/semilla/${encodeURIComponent(seedId)}`,
        };
      }
      return { label: "Ver proyectos", href: "/proyectos" };
    }
    case "review_pending":
      return { label: "Ver actividad", href: "/actividad" };
    case "interest_confirmation": {
      const circleId = metaStr(meta, "circleId");
      if (circleId) {
        return {
          label: "Ver círculo",
          href: `/circulos/${encodeURIComponent(circleId)}`,
        };
      }
      const projectId = metaStr(meta, "projectId");
      if (projectId) {
        return {
          label: "Ver proyecto",
          href: `/proyectos/${encodeURIComponent(projectId)}`,
        };
      }
      const targetId = metaStr(meta, "targetId");
      const targetKind = metaStr(meta, "targetKind");
      if (targetId && targetKind === "formation") {
        return {
          label: "Ver formación",
          href: `/eventos/${encodeURIComponent(targetId)}`,
        };
      }
      if (targetId && targetKind === "event") {
        return {
          label: "Ver evento",
          href: `/eventos/${encodeURIComponent(targetId)}`,
        };
      }
      return { label: "Ver actividad", href: "/actividad" };
    }
    case "next_step":
    case "community_seed":
      if (message.ctaHref && message.ctaHref !== "/actividad") {
        return {
          label: message.ctaLabel?.trim() || "Continuar",
          href: message.ctaHref,
        };
      }
      return { label: "Ir a la plaza", href: "/plaza" };
    default:
      break;
  }

  if (message.ctaHref) {
    return {
      label: message.ctaLabel?.trim() || "Continuar",
      href: message.ctaHref,
    };
  }

  return null;
}
