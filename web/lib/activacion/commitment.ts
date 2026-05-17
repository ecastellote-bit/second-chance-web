export type BarrioCommitmentId = "crear_proyecto" | "sumarme" | "explorar_primero";

export type BarrioCommitment = {
  id: BarrioCommitmentId;
  at: string;
  note?: string;
};

const KEY = "vu_barrio_commitment";

export const BARRIO_COMMITMENT_OPTIONS: {
  id: BarrioCommitmentId;
  label: string;
  description: string;
}[] = [
  {
    id: "crear_proyecto",
    label: "Crear o presentar mi proyecto",
    description: "Tengo una idea u obra y quiero buscar apoyo en el barrio",
  },
  {
    id: "sumarme",
    label: "Sumarme a un proyecto de otro",
    description: "Prefiero acompañar algo que ya está en marcha",
  },
  {
    id: "explorar_primero",
    label: "Explorar primero, compromiso en días",
    description: "Recorro el barrio y decido en los próximos días",
  },
];

export function setBarrioCommitment(commitment: BarrioCommitment): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(commitment));
}

export function getBarrioCommitment(): BarrioCommitment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BarrioCommitment;
    if (
      parsed?.id === "crear_proyecto" ||
      parsed?.id === "sumarme" ||
      parsed?.id === "explorar_primero"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}
