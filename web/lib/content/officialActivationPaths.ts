import type { GuidedThemeActivationPath } from "@/lib/types/guidedThemes";
import { ACTIVATION_PATH_LABELS } from "@/lib/tematicas/contextualBridge";

export type OfficialActivationPathId = GuidedThemeActivationPath;

export type OfficialActivationPathIcon =
  | "people"
  | "book"
  | "rocket"
  | "puzzle"
  | "compass";

export type OfficialActivationPath = {
  id: OfficialActivationPathId;
  label: string;
  description: string;
  plazaWelcome: string;
  icon: OfficialActivationPathIcon;
  primaryLinks: { label: string; route: string }[];
};

/** Los 5 caminos oficiales de activación (arquitectura producto). */
export const OFFICIAL_ACTIVATION_PATHS: OfficialActivationPath[] = [
  {
    id: "asociarme_con_otras_personas",
    label: ACTIVATION_PATH_LABELS.asociarme_con_otras_personas,
    description:
      "Encontrar personas con intereses parecidos y avanzar juntos, sin tener que armar todo solo.",
    plazaWelcome:
      "Te ubicamos cerca de quienes caminan un sueño parecido al tuyo. Empezá por círculos y proyectos abiertos.",
    icon: "people",
    primaryLinks: [
      { label: "Círculos del barrio", route: "/circulos" },
      { label: "Proyectos para sumarse", route: "/proyectos" },
    ],
  },
  {
    id: "formarme_en_algo_nuevo",
    label: ACTIVATION_PATH_LABELS.formarme_en_algo_nuevo,
    description:
      "Aprender una habilidad, oficio o camino que te acerque a lo que querés construir.",
    plazaWelcome:
      "Tu entrada apunta a formación y práctica. Mirá convocatorias y espacios para aprender a tu ritmo.",
    icon: "book",
    primaryLinks: [
      { label: "Formación en el barrio", route: "/formacion" },
      { label: "Eventos y convocatorias", route: "/eventos" },
    ],
  },
  {
    id: "integrar_proyectos_existentes",
    label: ACTIVATION_PATH_LABELS.integrar_proyectos_existentes,
    description:
      "Sumarte a algo que ya está en marcha y donde tu perfil puede aportar de verdad.",
    plazaWelcome:
      "Buscás integrarte a iniciativas que ya existen. Explorá proyectos abiertos y sumá tu interés.",
    icon: "puzzle",
    primaryLinks: [
      { label: "Proyectos del barrio", route: "/proyectos" },
      { label: "Taller vecinal de ejemplo", route: "/proyectos/manos-que-transforman" },
    ],
  },
  {
    id: "armar_mi_propio_proyecto",
    label: ACTIVATION_PATH_LABELS.armar_mi_propio_proyecto,
    description:
      "Dar forma a una idea propia, ordenarla y buscar visibilidad o aliados en la Comunidad.",
    plazaWelcome:
      "Tu camino es crear y presentar algo propio. Podés sembrar tu proyecto y ver ejemplos del barrio.",
    icon: "rocket",
    primaryLinks: [
      { label: "Sembrar mi proyecto", route: "/proyectos/sembrar" },
      { label: "Proyectos del barrio", route: "/proyectos" },
    ],
  },
  {
    id: "explorar_primero_comunidad",
    label: ACTIVATION_PATH_LABELS.explorar_primero_comunidad,
    description:
      "Recorrer el barrio con calma, mirar ejemplos y decidir el próximo paso sin apuro.",
    plazaWelcome:
      "Sin prisa: recorré la plaza, las puertas y los espacios semilla hasta que algo te llame.",
    icon: "compass",
    primaryLinks: [
      { label: "Mapa de la plaza", route: "/plaza?mapa=1" },
      { label: "Círculos del barrio", route: "/circulos" },
    ],
  },
];

export function getOfficialActivationPath(
  id: string | null | undefined,
): OfficialActivationPath | undefined {
  if (!id) return undefined;
  return OFFICIAL_ACTIVATION_PATHS.find((path) => path.id === id);
}

export function isOfficialActivationPathId(
  value: string | null | undefined,
): value is OfficialActivationPathId {
  return Boolean(getOfficialActivationPath(value));
}
