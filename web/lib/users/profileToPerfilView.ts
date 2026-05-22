import type { PerfilUsuario } from "@/lib/content/perfilCatalog";
import { initialsFromName, type VuUserProfileRecord } from "./userProfileTypes";

export function userProfileToPerfilView(
  profile: VuUserProfileRecord,
): PerfilUsuario {
  const toChips = (labels: string[]) =>
    labels.map((label, i) => ({ id: `chip-${i}`, label }));

  return {
    id: profile.userId,
    name: profile.displayName,
    initials: initialsFromName(profile.displayName),
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
    hitos: profile.diagnosticArchiveId
      ? [
          {
            id: "h-dx",
            title: "Completaste tu diagnóstico vocacional",
            when: "Registrado en VocationUp",
          },
          {
            id: "h-profile",
            title: "Creaste tu perfil en el barrio",
            when: "Perfil activo",
          },
        ]
      : [
          {
            id: "h-profile",
            title: "Creaste tu perfil en el barrio",
            when: "Perfil activo",
          },
        ],
  };
}
