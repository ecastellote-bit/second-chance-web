import {
  TEAM_FOUNDER_CIRCLES,
  TEAM_FOUNDER_PROJECTS,
  TEAM_TENTATIVE_EVENTS,
} from "./teamFounderSeeds";

export type BarrioTrustChip = {
  label: string;
  href: string;
};

export const BARRIO_TRUST_CHIPS: BarrioTrustChip[] = [
  { label: "Proyectos", href: "/proyectos" },
  { label: "Vivos", href: "/proyectos/vivos" },
  { label: "Comunidad", href: "/comunidad" },
  { label: "Formación", href: "/formacion" },
  { label: "Círculos", href: "/circulos" },
  { label: "Eventos", href: "/eventos" },
];

export const BARRIO_PREDICTIVE_COPY = {
  eyebrow: "VOCATIONUP · SECOND CHANCE",
  title: "Entrá al barrio",
  subtitle:
    "Proyectos, equipos colaborativos, comunidad, formación y encuentros para empezar a moverte.",
  primaryCta: "Hacer mi lectura sin costo",
  secondaryCta: "Explorar puertas",
  liveSectionTitle: "Ya hay mesas empezando a moverse",
} as const;

export type BarrioActionCard = {
  id: string;
  title: string;
  line: string;
  cta: string;
  href: string;
  image: string;
  fallbackImage: string;
};

export const BARRIO_ACTION_CARDS: BarrioActionCard[] = [
  {
    id: "proyectos",
    title: "Ver proyectos semilla",
    line: "Ideas del equipo y de la comunidad que buscan primeras señales.",
    cta: "Entrar",
    href: "/proyectos",
    image: "/vu/seeds/projects/radio-second-chance.jpg",
    fallbackImage: "/vu/proyecto-manos-transforman.png",
  },
  {
    id: "vivos",
    title: "Proyectos vivos",
    line: "Equipos en marcha: postularte, roles abiertos y hitos reales.",
    cta: "Entrar",
    href: "/proyectos/vivos",
    image: "/vu/mesa-ideas-compartidas.jpeg",
    fallbackImage: "/vu/proyecto-manos-transforman.png",
  },
  {
    id: "comunidad",
    title: "Comunidad",
    line: "Publicá, leé y sumate a lo que se construye juntos.",
    cta: "Abrir feed",
    href: "/comunidad",
    image: "/vu/puerta-conectar-otros.png",
    fallbackImage: "/vu/evento-cafe-conexiones-vc.png",
  },
  {
    id: "sembrar",
    title: "Sembrar mi idea",
    line: "Dejá una primera semilla para revisión del equipo.",
    cta: "Sembrar",
    href: "/proyectos/sembrar",
    image: "/vu/mesa-ideas-compartidas.jpeg",
    fallbackImage: "/vu/proyecto-huerta-compartida.png",
  },
  {
    id: "formacion",
    title: "Explorar formación",
    line: "Primeras rutas para aprender, practicar y volver a moverte.",
    cta: "Ver formación",
    href: "/formacion",
    image: "/vu/aprender-acompanado-taller.jpeg",
    fallbackImage: "/vu/seeds/projects/oficios-que-ensenan.jpg",
  },
  {
    id: "circulos",
    title: "Círculos del catálogo",
    line: "Temas de afinidad del barrio (no son grupos cerrados).",
    cta: "Ver círculos",
    href: "/circulos",
    image: "/vu/seeds/circles/empezar-de-nuevo.jpg",
    fallbackImage: "/vu/circulo-reinicio-40.png",
  },
  {
    id: "eventos",
    title: "Ver encuentros",
    line: "Primeras mesas tentativas Second Chance.",
    cta: "Ver eventos",
    href: "/eventos",
    image: "/vu/seeds/events/mesa-second-chance-caba.jpg",
    fallbackImage: "/vu/evento-cafe-conexiones-vc.png",
  },
  {
    id: "lectura",
    title: "Hacer mi lectura",
    line: "Orientá mejor tu recorrido en 7–10 minutos.",
    cta: "Empezar",
    href: "/full?founder=1",
    image: "/vu/puerta-abierta-bienvenida.jpeg",
    fallbackImage: "/vu/patio-vivo-escena-coral.jpeg",
  },
];

export type BarrioLivePreview = {
  id: string;
  title: string;
  badge: string;
  href: string;
  image: string;
  fallbackImage: string;
};

function projectPreview(id: string, href?: string): BarrioLivePreview | null {
  const p = TEAM_FOUNDER_PROJECTS.find((x) => x.id === id);
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    badge: p.badge,
    href: href ?? `/proyectos/${p.id}`,
    image: p.image,
    fallbackImage: p.fallbackImage,
  };
}

function circlePreview(id: string): BarrioLivePreview | null {
  const c = TEAM_FOUNDER_CIRCLES.find((x) => x.id === id);
  if (!c) return null;
  return {
    id: c.id,
    title: c.title,
    badge: c.badge,
    href: `/circulos/${c.id}`,
    image: c.image,
    fallbackImage: c.fallbackImage,
  };
}

function eventPreview(id: string): BarrioLivePreview | null {
  const e = TEAM_TENTATIVE_EVENTS.find((x) => x.id === id);
  if (!e) return null;
  return {
    id: e.id,
    title: `Mesa Second Chance · ${e.city}`,
    badge: e.badge,
    href: `/eventos/${e.id}`,
    image: e.image,
    fallbackImage: e.fallbackImage,
  };
}

export const BARRIO_LIVE_PREVIEWS: BarrioLivePreview[] = [
  projectPreview("radio-second-chance"),
  projectPreview("banco-ideas-dormidas"),
  projectPreview("oficios-que-ensenan"),
  eventPreview("mesa-sc-caba"),
  circlePreview("empezar-de-nuevo"),
].filter((x): x is BarrioLivePreview => x !== null);
