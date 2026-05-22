import type { ActivacionCartelId } from "../content/activacionCatalog";

export type DiagnosticThreadResonance = "alta" | "media" | "exploratoria";

/** Cita con fundamento explícito (narrativo o intake). */
export type CitaFundamentada = {
  texto: string;
  fuente: "narrativo" | "intake";
  momento?: string;
  fundamento: string;
};

export type AlertaLectura = {
  titulo: string;
  cuerpo: string;
  severidad: "alta" | "media" | "baja";
};

/** Columna vertebral: juez de coherencia narrativa. */
export type LecturaCentral = {
  sentenciaRevelacion: string;
  resumen: string;
  tensionViva: string;
  porQue: string;
};

export type ReferenciaQueResuena = {
  familyId: string;
  referenceTitle: string;
  referenceBody: string;
  resonance: DiagnosticThreadResonance;
  puenteNarrativo: string;
  evidenciasVinculadas?: CitaFundamentada[];
};

export type PersonalizedDiagnosticPresentation = {
  lecturaCentral: LecturaCentral;
  enTusPalabras: CitaFundamentada[];
  alertasLectura: AlertaLectura[];
  momentoVital: string;
  referenciasQueResuenan: ReferenciaQueResuena[];
  comoArmamosTuLectura: string;
  loQueNoCerramos: string;
  siguientePaso: {
    invitation: string;
    themeTeaser: string[];
    activacionSugerida?: {
      cartelId: ActivacionCartelId;
      label: string;
      plazaWelcomeLine: string;
    };
  };
  meta: {
    composedAt: string;
    sourcesUsed: string[];
    narrativeVerdict?: string;
    evidenceCount: number;
    citasCount: number;
  };
};

/** @deprecated Usar referenciasQueResuenan — alias para migración UI parcial */
export type DiagnosticThread = ReferenciaQueResuena & {
  evidenceQuote?: string;
};
