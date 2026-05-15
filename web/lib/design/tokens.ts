/**
 * VocationUp — Sistema visual oficial (ChatGPT / Second Chance)
 * Referencia: paleta, tipografía, radios 16/24/32, sombra suave, grid 8pt.
 */
export const vuTokens = {
  color: {
    navy: "#0B2E59",
    navyHover: "#081f3d",
    teal: "#1A9BB0",
    tealHover: "#158799",
    lime: "#C6D92D",
    limeHover: "#b3c428",
    mist: "#F8FAFC",
    surface: "#FFFFFF",
    sky: "#E7EEF5",
    graphite: "#1F2A37",
    graphiteMuted: "#4B5563",
    graphiteSubtle: "#6B7280",
    border: "#E7EEF5",
    borderStrong: "#CBD5E1",
    danger: "#DC2626",
    dangerSoft: "#FEF2F2",
    warning: "#D97706",
    warningSoft: "#FFFBEB",
    success: "#059669",
    successSoft: "#ECFDF5",
  },
  typography: {
    h1: { size: "1.75rem", lineHeight: "2.25rem", weight: 700, tracking: "-0.3px" },
    h2: { size: "1.25rem", lineHeight: "1.75rem", weight: 600, tracking: "-0.2px" },
    body: { size: "1rem", lineHeight: "1.5rem", weight: 400, tracking: "0" },
    button: { size: "1rem", lineHeight: "1.25rem", weight: 600, tracking: "0.2px" },
    caption: { size: "0.75rem", lineHeight: "1rem", weight: 400, tracking: "0" },
  },
  radius: {
    sm: "16px",
    md: "24px",
    lg: "32px",
  },
  shadow: {
    soft: "0 4px 16px rgba(15, 42, 70, 0.08)",
    softHover: "0 8px 24px rgba(15, 42, 70, 0.12)",
  },
  spacing: [8, 16, 24, 32, 40, 48, 64] as const,
  touchMin: 44,
} as const;

export type VuDoorId = "entender_camino" | "proximo_movimiento" | "conectar_con_otros";

/** Puertas de entrada — colores según mockup (azul / teal / lima) */
export const vuDoorTokens: Record<
  VuDoorId,
  {
    label: string;
    subtitle: string;
    mockupLine: string;
    accent: string;
    accentSoft: string;
    border: string;
    icon: string;
  }
> = {
  entender_camino: {
    label: "Entender mi camino",
    subtitle: "Formación y aprendizaje",
    mockupLine: "Quiero entender mi camino",
    accent: vuTokens.color.navy,
    accentSoft: "#E8EEF8",
    border: "#9BB4DC",
    icon: "🧭",
  },
  proximo_movimiento: {
    label: "Próximo movimiento",
    subtitle: "Proyectos y oportunidades",
    mockupLine: "Quiero encontrar mi próximo movimiento",
    accent: vuTokens.color.teal,
    accentSoft: "#E6F6FA",
    border: "#7DD3E8",
    icon: "🚀",
  },
  conectar_con_otros: {
    label: "Conectar con otros",
    subtitle: "Círculos y comunidad",
    mockupLine: "Quiero volver a conectar con otros",
    accent: vuTokens.color.lime,
    accentSoft: "#F4F9E0",
    border: "#D4E86A",
    icon: "👥",
  },
};
