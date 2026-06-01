import { COMMUNITY_EXAMPLE_CONVERSATIONS_LABEL } from "@/lib/content/communitySeedCopy";

export type CooperativeVoiceExample = {
  id: string;
  author: string;
  body: string;
  initials: string;
  accent: string;
};

export const CIRCLES_VOICE_EXAMPLES: CooperativeVoiceExample[] = [
  {
    id: "c1",
    author: "María S.",
    body: "Me gustaría un espacio para retomar la escritura sin presión de publicar ni competir.",
    initials: "MS",
    accent: "#1A9BB0",
  },
  {
    id: "c2",
    author: "Tomás R.",
    body: "Busco un círculo donde pueda compartir dudas sobre tecnología con ritmo humano.",
    initials: "TR",
    accent: "#0B2E59",
  },
  {
    id: "c3",
    author: "Julieta P.",
    body: "Quiero sumarme a algo de impacto local sin promesas de éxito inmediato.",
    initials: "JP",
    accent: "#C6D92D",
  },
];

export const CONECTAR_VOICE_EXAMPLES: CooperativeVoiceExample[] = [
  {
    id: "x1",
    author: "Integrante del barrio",
    body: "Yo podría ayudar a ordenar una idea que todavía está verde.",
    initials: "IB",
    accent: "#1A9BB0",
  },
  {
    id: "x2",
    author: "Vecina activa",
    body: "Me gustaría sumarme a algo relacionado con comunicación o comunidad.",
    initials: "VA",
    accent: "#0B2E59",
  },
  {
    id: "x3",
    author: "Otro integrante",
    body: "Tengo experiencia en gestión, pero no quiero empezar solo.",
    initials: "OG",
    accent: "#C6D92D",
  },
];

export const FORMATION_THEME_EXAMPLES: { id: string; excerpt: string }[] = [
  {
    id: "f1",
    excerpt: "Comunicación digital aplicada a proyectos comunitarios.",
  },
  {
    id: "f2",
    excerpt: "Oficios prácticos con talleres cortos y acompañamiento entre pares.",
  },
  {
    id: "f3",
    excerpt: "Gestión de proyectos para quienes están armando su primer movimiento.",
  },
];

export { COMMUNITY_EXAMPLE_CONVERSATIONS_LABEL };
