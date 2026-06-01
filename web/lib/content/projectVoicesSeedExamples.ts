export type ProjectVoiceSeedExample = {
  id: string;
  author: string;
  body: string;
  initials: string;
  accent: string;
};

/** Ejemplos cooperativos — nunca presentados como chat en vivo. */
export const PROJECT_VOICES_SEED_EXAMPLES: ProjectVoiceSeedExample[] = [
  {
    id: "ex-1",
    initials: "MS",
    author: "María S.",
    body: "Me gustaría sumar tiempo los fines de semana si encaja con el ritmo del grupo.",
    accent: "#1A9BB0",
  },
  {
    id: "ex-2",
    initials: "TR",
    author: "Tomás R.",
    body: "Podría aportar experiencia en organización y primeros pasos con aliados del barrio.",
    accent: "#0B2E59",
  },
  {
    id: "ex-3",
    initials: "JP",
    author: "Julieta P.",
    body: "Conozco un espacio parecido; me interesa ver cómo lo están armando acá.",
    accent: "#C6D92D",
  },
];
