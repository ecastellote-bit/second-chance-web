/** Copy de conversión — pantalla inicial /fundador (mobile-first, sin jerga interna). */
export const FUNDADOR_LANDING_COPY = {
  eyebrow: "VOCATIONUP · SECOND CHANCE",
  title: "Encontrá tu próximo movimiento",
  subtitle:
    "Una lectura inicial para adultos que sienten que su trabajo o su etapa actual ya no los representa.",
  trustChips: ["Sin costo", "Sin tarjeta", "7–10 min", "Privado"] as const,
  primaryCta: "Empezar mi lectura sin costo",
  secondaryCta: "Ver proyectos y comunidad",
  microcopy: "Sin tarjeta. Sin pago al final.",
  barrioSectionTitle: "También hay un barrio empezando a moverse",
  alreadyHaveReadingCta: "Ya tengo mi lectura",
} as const;

export const FUNDADOR_BARRIO_HOOKS = [
  {
    id: "projects",
    title: "Proyectos que buscan manos",
    cta: "Ver proyectos",
    href: "/proyectos",
    image: "/vu/proyecto-manos-transforman.png",
    fallbackImage: "/vu/proyecto-huerta-compartida.png",
  },
  {
    id: "partners",
    title: "Personas impulsando ideas",
    cta: "Conectar",
    href: "/circulos",
    image: "/vu/puerta-conectar-otros.png",
    fallbackImage: "/vu/evento-cafe-conexiones-vc.png",
  },
  {
    id: "activate",
    title: "Oportunidades activas",
    cta: "Explorar",
    href: "/eventos",
    image: "/vu/evento-emprende-proposito.png",
    fallbackImage: "/vu/evento-ideas-comunidad.png",
  },
] as const;

export const FUNDADOR_HERO_ASSETS = {
  src: "/vu/patio-vivo-escena-coral.jpeg",
  fallbackSrc: "/vu/puerta-abierta-bienvenida.jpeg",
  objectPosition: "center 30%",
} as const;
