export type TematicaCard = {
  id: string;
  title: string;
  image: string;
  accent: "#0B2E59" | "#1A9BB0" | "#C6D92D";
  badge?: string;
};

export const TEMATICAS_HEADER = {
  title: "Temáticas",
  subtitle: "Elegí lo que más se parece a tu momento.",
} as const;

export const TEMATICAS_CATALOG: TematicaCard[] = [
  {
    id: "reordenar_camino",
    title: "Quiero reordenar mi camino",
    image: "/vu/tema-reordenar-camino.png",
    accent: "#0B2E59",
  },
  {
    id: "escribir_crear",
    title: "Volver a escribir o crear",
    image: "/vu/tema-escribir-crear.png",
    accent: "#1A9BB0",
  },
  {
    id: "aprender_nuevo",
    title: "Aprender algo nuevo",
    image: "/vu/tema-aprender-nuevo.png",
    accent: "#C6D92D",
    badge: "Muy activo",
  },
  {
    id: "construir_otros",
    title: "Construir algo con otros",
    image: "/vu/tema-construir-otros.png",
    accent: "#1A9BB0",
  },
  {
    id: "salir_scroll",
    title: "Salir del scroll y hacer algo real",
    image: "/vu/tema-salir-scroll.png",
    accent: "#0B2E59",
  },
  {
    id: "afinidad_dormida",
    title: "Explorar una afinidad dormida",
    image: "/vu/tema-afinidad-dormida.png",
    accent: "#C6D92D",
  },
  {
    id: "trabajo_emprendimiento",
    title: "Trabajo y emprendimiento",
    image: "/vu/tema-trabajo-emprendimiento.png",
    accent: "#0B2E59",
  },
  {
    id: "bienestar_proposito",
    title: "Bienestar y propósito",
    image: "/vu/tema-bienestar-proposito.png",
    accent: "#1A9BB0",
    badge: "Muy activo",
  },
  {
    id: "comunidad_pertenencia",
    title: "Comunidad y pertenencia",
    image: "/vu/tema-comunidad-pertenencia.png",
    accent: "#C6D92D",
  },
  {
    id: "creatividad_expresion",
    title: "Creatividad y expresión",
    image: "/vu/tema-creatividad-expresion.png",
    accent: "#1A9BB0",
  },
];
