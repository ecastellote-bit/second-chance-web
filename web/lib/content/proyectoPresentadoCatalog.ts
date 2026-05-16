export type ProjectModality = "presencial" | "online" | "hibrido";

export type ProjectComment = {
  id: string;
  author: string;
  body: string;
  /** Iniciales para avatar */
  initials: string;
  accent: string;
};

export type PresentedProject = {
  id: string;
  screenTitle: string;
  title: string;
  description: string;
  badge: string;
  modality: ProjectModality;
  modalityLabel: string;
  location: string;
  creator: {
    name: string;
    initials: string;
    verified: boolean;
    role: string;
  };
  interestedCount: number;
  commentCount: number;
  tags: string[];
  image: string;
  comments: ProjectComment[];
};

export const PRESENTED_PROJECT: PresentedProject = {
  id: "manos-que-transforman",
  screenTitle: "Proyecto presentado",
  title: "Taller Vecinal: Manos que Transforman",
  description:
    "Un espacio comunitario para aprender carpintería básica, reutilizar materiales y crear muebles funcionales para mejorar nuestro barrio.",
  badge: "Nuevo proyecto",
  modality: "presencial",
  modalityLabel: "Presencial",
  location: "Villa Crespo, CABA",
  creator: {
    name: "Lucas M.",
    initials: "LM",
    verified: true,
    role: "Vecino · impulsor del taller",
  },
  interestedCount: 24,
  commentCount: 4,
  tags: ["Carpintería", "Sustentabilidad", "Comunidad", "Aprendizaje"],
  image: "/vu/proyecto-manos-transforman.png",
  comments: [
    {
      id: "c1",
      author: "María Sol",
      body: "¡Qué buena iniciativa! Me encantaría participar. ¿Cuándo arrancan?",
      initials: "MS",
      accent: "#1A9BB0",
    },
    {
      id: "c2",
      author: "Tomás R.",
      body: "Cuenten conmigo. Tengo herramientas y experiencia con diseño. ¡Puedo ayudar!",
      initials: "TR",
      accent: "#0B2E59",
    },
    {
      id: "c3",
      author: "Julieta P.",
      body: "Soy profe de talleres de reciclaje; si necesitan apoyo, acá estoy.",
      initials: "JP",
      accent: "#C6D92D",
    },
    {
      id: "c4",
      author: "VecinaActiva",
      body: "Desde la asociación podemos difundirlo en el barrio para sumar más manos.",
      initials: "VA",
      accent: "#6B7A8C",
    },
  ],
};

export function getPresentedProject(id: string): PresentedProject | undefined {
  if (id === PRESENTED_PROJECT.id) return PRESENTED_PROJECT;
  return undefined;
}
