import type { PerfilUsuario } from "@/lib/content/perfilCatalog";
import { initialsFromName, type UserProfileClientView } from "./userProfileTypes";

export function userProfileToPerfilView(
  profile: UserProfileClientView,
): PerfilUsuario {
  const toChips = (labels: string[]) =>
    labels.map((label, i) => ({ id: `chip-${i}`, label }));

  return {
    id: profile.userId,
    name: profile.displayName,
    initials: initialsFromName(profile.displayName),
    avatarUrl: profile.avatarUrl ?? undefined,
    coverUrl: profile.coverUrl ?? undefined,
    headline: profile.headline,
    momentoActual: profile.momentoActual,
    caminoProgress: profile.caminoProgress,
    caminoLabel: profile.diagnosticArchiveId
      ? "Diagnóstico archivado · camino activo"
      : "Perfil creado · camino iniciado",
    afinidades: [],
    buscando: toChips(profile.buscando),
    aportar: toChips(profile.aportar),
    circulosActivos: [],
    proyectos: [],
    proximoMovimiento: {
      title: "Explorá el barrio",
      description:
        "Tu perfil ya está visible para otras personas. El próximo paso puede ser un círculo, un proyecto o la plaza.",
      cta: "Ir a la plaza",
      href: "/plaza",
    },
    hitos: [],
  };
}
