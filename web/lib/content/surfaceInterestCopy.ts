import type { SurfaceIntentType } from "@/lib/learning/surfaceInterestLeads";

export type SurfaceInterestConfig = {
  intentType: SurfaceIntentType;
  title: string;
  subtitle?: string;
  placeholder: string;
  primaryCta: string;
  footnote: string;
  emailStepTitle: string;
  emailStepCopy: string;
  emailCta: string;
  successTitle: string;
  /** Sin perfil en el dispositivo */
  successCopy: string;
  /** Con perfil ya reconocido (Serie 3) */
  successCopyWithProfile?: string;
  continueHref: string;
  continueLabel?: string;
  exploreMoreHref?: string;
  exploreMoreLabel?: string;
  actionChips?: { id: string; label: string }[];
};

export const FORMACION_INTEREST: SurfaceInterestConfig = {
  intentType: "formacion",
  title: "¿Qué te gustaría aprender o practicar?",
  subtitle: "Sugerí una formación en una línea — sin perfil, sin inscripción.",
  placeholder:
    "Ej.: comunicación digital, oficios prácticos, ventas, radio, carpintería, organización de proyectos…",
  primaryCta: "Enviar interés",
  footnote: "No necesitás perfil para decirnos esto.",
  emailStepTitle: "Dejanos tu email",
  emailStepCopy:
    "Te avisamos si armamos algo sobre esto o aparece una propuesta relacionada. No es un registro de usuario.",
  emailCta: "Avisarme avances",
  successTitle: "Ya quedó registrado",
  successCopy:
    "Tu interés quedó guardado. Seguí explorando las rutas de abajo o el barrio — el perfil es opcional.",
  successCopyWithProfile:
    "Tu interés quedó guardado. Podés mirar las primeras rutas abajo o seguir en el barrio con tu perfil.",
  continueHref: "/formacion#primeras-rutas",
  continueLabel: "Ver primeras rutas",
  exploreMoreHref: "/barrio",
  exploreMoreLabel: "Entrar al barrio",
  actionChips: [
    { id: "comunicacion", label: "Comunicación" },
    { id: "oficios", label: "Oficios" },
    { id: "gestion", label: "Gestión" },
    { id: "tecnologia", label: "Tecnología" },
  ],
};

export const PROYECTOS_INTEREST: SurfaceInterestConfig = {
  intentType: "proyectos",
  title: "¿Qué proyecto te gustaría impulsar o a cuál te sumarías?",
  subtitle: "Dejá una señal o sembrá tu idea si ya sos fundador.",
  placeholder: "Ej.: radio comunitaria, taller de oficios, app local, emprendimiento social…",
  primaryCta: "Enviar interés",
  footnote: "No necesitás perfil para dejar esta señal.",
  emailStepTitle: "Dejanos tu email",
  emailStepCopy: "Te avisamos si aparece algo parecido o se abre una mesa relacionada.",
  emailCta: "Avisarme avances",
  successTitle: "Interés registrado",
  successCopy: "Guardamos tu señal. Seguí explorando proyectos del barrio — el perfil es opcional.",
  successCopyWithProfile:
    "Guardamos tu señal. Podés seguir viendo convocatorias o sumarte a un proyecto vivo.",
  continueHref: "/proyectos",
  continueLabel: "Ver proyectos",
  exploreMoreHref: "/proyectos/vivos",
  exploreMoreLabel: "Proyectos vivos",
  actionChips: [
    { id: "proponer", label: "Quiero proponer una idea" },
    { id: "sumarme", label: "Quiero sumarme a proyectos" },
    { id: "socios", label: "Quiero encontrar socios" },
  ],
};

export const CIRCULOS_INTEREST: SurfaceInterestConfig = {
  intentType: "circulos",
  title: "¿Sobre qué te gustaría encontrarte con otras personas?",
  subtitle: "Proponé un círculo o dejá una señal — no hace falta crear uno ahora.",
  placeholder: "Ej.: reinicio profesional, escritura, tecnología con ritmo humano, impacto local…",
  primaryCta: "Enviar interés",
  footnote: "No necesitás perfil para proponer un círculo o sumarte.",
  emailStepTitle: "Dejanos tu email",
  emailStepCopy: "Te avisamos si se arma un círculo sobre esto o algo parecido.",
  emailCta: "Avisarme avances",
  successTitle: "Interés registrado",
  successCopy: "Tu señal quedó guardada. Seguí explorando — el perfil es opcional.",
  successCopyWithProfile:
    "Tu señal quedó guardada. Podés mirar el catálogo o la comunidad viva.",
  continueHref: "/circulos",
  continueLabel: "Ver círculos",
  exploreMoreHref: "/comunidad",
  exploreMoreLabel: "Ir a la comunidad",
  actionChips: [
    { id: "proponer", label: "Quiero proponer un círculo" },
    { id: "sumarme", label: "Quiero sumarme a un círculo" },
    { id: "aviso", label: "Quiero recibir aviso si se arma uno" },
  ],
};

export const EVENTOS_INTEREST: SurfaceInterestConfig = {
  intentType: "eventos",
  title: "¿Qué encuentro te gustaría ver en el barrio?",
  subtitle: "Proponé un encuentro o dejá una señal — sin crear evento todavía.",
  placeholder: "Ej.: Córdoba, mesa presencial, charla sobre reinicio, café de conexiones…",
  primaryCta: "Enviar interés",
  footnote: "No necesitás perfil para sugerir un encuentro.",
  emailStepTitle: "Dejanos tu email",
  emailStepCopy: "Te avisamos si organizamos algo en esa zona o con ese formato.",
  emailCta: "Avisarme avances",
  successTitle: "Interés registrado",
  successCopy: "Tu sugerencia quedó guardada. Seguí viendo encuentros — el perfil es opcional.",
  successCopyWithProfile:
    "Tu sugerencia quedó guardada. Podés seguir el calendario o entrar al barrio.",
  continueHref: "/eventos",
  continueLabel: "Ver encuentros",
  exploreMoreHref: "/barrio",
  exploreMoreLabel: "Entrar al barrio",
};

export const FORMACION_PREDICTIVE = {
  eyebrow: "Rutas de aprendizaje",
  title: "Formación en el barrio",
  subtitle: "Decinos qué te gustaría aprender — el resto lo vamos armando juntos.",
  chips: ["Comunicación", "Oficios", "Gestión", "Tecnología"] as const,
  routesTitle: "Primeras rutas posibles",
  heroImage: "/vu/aprender-acompanado-taller.jpeg",
  heroFallback: "/vu/seeds/projects/radio-second-chance.jpg",
} as const;

export const FORMACION_ROUTE_CARDS = [
  {
    id: "f1",
    title: "Comunicación digital",
    line: "Radio comunitaria y presencia en red — ejemplo vivo del barrio.",
    image: "/vu/seeds/projects/radio-second-chance.jpg",
    fallback: "/vu/proyecto-radio-barrial.png",
    href: "/proyectos/semilla/radio-second-chance",
  },
  {
    id: "f2",
    title: "Oficios prácticos",
    line: "Talleres cortos con acompañamiento entre pares.",
    image: "/vu/seeds/projects/oficios-que-ensenan.jpg",
    fallback: "/vu/proyecto-manos-transforman.png",
    href: "/eventos/carpinteria-primeros-proyectos",
  },
  {
    id: "f3",
    title: "Gestión de proyectos",
    line: "Equipos en marcha y roles abiertos para tu primer movimiento.",
    image: "/vu/seeds/projects/banco-ideas-dormidas.jpg",
    fallback: "/vu/mesa-ideas-compartidas.jpeg",
    href: "/proyectos/vivos",
  },
  {
    id: "f4",
    title: "Reinicio y orientación",
    line: "Afinidades del catálogo y voz en la comunidad.",
    image: "/vu/seeds/projects/reinicio-laboral-adulto.jpg",
    fallback: "/vu/circulo-reinicio-40.png",
    href: "/circulos/empezar-de-nuevo",
  },
] as const;
