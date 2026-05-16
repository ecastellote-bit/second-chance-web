export type PerfilChip = {
  id: string;
  label: string;
};

export type PerfilCirculoActivo = {
  id: string;
  title: string;
  members: number;
  online: number;
};

export type PerfilProyecto = {
  id: string;
  title: string;
  role: string;
};

export type PerfilHito = {
  id: string;
  title: string;
  when: string;
};

export type PerfilUsuario = {
  id: string;
  name: string;
  initials: string;
  /** Retrato circular (rostro) */
  avatarUrl?: string;
  /** Franja superior — escena del barrio o del momento */
  coverUrl?: string;
  headline: string;
  momentoActual: string;
  caminoProgress: number;
  caminoLabel: string;
  afinidades: PerfilChip[];
  buscando: PerfilChip[];
  aportar: PerfilChip[];
  circulosActivos: PerfilCirculoActivo[];
  proyectos: PerfilProyecto[];
  proximoMovimiento: {
    title: string;
    description: string;
    cta: string;
    href: string;
  };
  hitos: PerfilHito[];
};

export const PERFIL_MARIA_SOL: PerfilUsuario = {
  id: "maria-sol",
  name: "María Sol",
  initials: "MS",
  avatarUrl: "/vu/perfil-maria-sol.png",
  coverUrl: "/vu/plaza-inicial.png",
  headline: "Reordenando mi camino creativo y comunitario",
  momentoActual:
    "Estoy en una etapa de transición con ganas de volver a escribir y conectar con proyectos que tengan sentido en el barrio. No busco un cambio brusco: quiero pasos concretos, con otras personas.",
  caminoProgress: 62,
  caminoLabel: "Camino en construcción",
  afinidades: [
    { id: "escritura", label: "Escritura" },
    { id: "comunidad", label: "Comunidad" },
    { id: "aprendizaje", label: "Aprendizaje" },
    { id: "comunicacion", label: "Comunicación" },
    { id: "proyectos-sociales", label: "Proyectos sociales" },
  ],
  buscando: [
    { id: "volver-escribir", label: "Volver a escribir" },
    { id: "sumarme-proyectos", label: "Sumarme a proyectos" },
    { id: "herramientas-digitales", label: "Aprender herramientas digitales" },
  ],
  aportar: [
    { id: "organizacion", label: "Organización" },
    { id: "comunicacion-ap", label: "Comunicación" },
    { id: "escucha", label: "Escucha" },
    { id: "experiencia-educativa", label: "Experiencia educativa" },
  ],
  circulosActivos: [
    { id: "volver-a-escribir", title: "Volver a escribir", members: 48, online: 6 },
    { id: "bienestar-equilibrio", title: "Bienestar y equilibrio", members: 53, online: 9 },
  ],
  proyectos: [
    {
      id: "manos-que-transforman",
      title: "Taller Vecinal: Manos que Transforman",
      role: "Colaboradora · talleres de texto",
    },
  ],
  proximoMovimiento: {
    title: "Café & Conexiones Villa Crespo",
    description: "Un encuentro presencial para charlar, escuchar y ver si este es tu próximo paso.",
    cta: "Ver encuentro",
    href: "/eventos/cafe-conexiones-vc",
  },
  hitos: [
    { id: "h1", title: "Se sumó al círculo Volver a escribir", when: "Hace 2 semanas" },
    { id: "h2", title: "Compartió su momento actual en la plaza", when: "Hace 1 mes" },
    { id: "h3", title: "Marcó interés en el taller vecinal", when: "Esta semana" },
  ],
};
