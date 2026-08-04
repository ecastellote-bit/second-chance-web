/**
 * Serie 6 — destinos vivos del barrio.
 * Preferir estos hrefs en CTAs, vacíos y pies de pantalla.
 * Si un CTA nuevo no puede mapear a uno de estos, no se shippea.
 */
export const ALIVE_LINKS = {
  barrio: { href: "/barrio", label: "Entrar al barrio" },
  plaza: { href: "/plaza", label: "Ir a la plaza" },
  fundador: { href: "/fundador", label: "Volver a fundador" },
  proyectos: { href: "/proyectos", label: "Proyectos semilla" },
  vivos: { href: "/proyectos/vivos", label: "Proyectos vivos" },
  sembrar: { href: "/proyectos/sembrar", label: "Sembrar una idea" },
  circulos: { href: "/circulos", label: "Círculos del catálogo" },
  comunidad: { href: "/comunidad", label: "Comunidad" },
  connect: { href: "/community/conectar_con_otros", label: "Directorio Connect" },
  formacion: { href: "/formacion", label: "Formación" },
  eventos: { href: "/eventos", label: "Encuentros" },
  mensajes: { href: "/mensajes", label: "Mis mensajes" },
  actividad: { href: "/actividad", label: "Mi actividad" },
  notificaciones: { href: "/notificaciones", label: "Notificaciones" },
  activacion: { href: "/activacion", label: "Elegir cómo empezar" },
  lectura: { href: "/full?founder=1", label: "Hacer mi lectura" },
} as const;

export type AliveLinkId = keyof typeof ALIVE_LINKS;
