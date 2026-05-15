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
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e035f?w=600&auto=format&fit=crop&q=85",
    accent: "#0B2E59",
  },
  {
    id: "escribir_crear",
    title: "Volver a escribir o crear",
    image:
      "https://images.unsplash.com/photo-1455390577502-b1f1767a4fb9?w=600&auto=format&fit=crop&q=85",
    accent: "#1A9BB0",
  },
  {
    id: "aprender_nuevo",
    title: "Aprender algo nuevo",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=85",
    accent: "#C6D92D",
    badge: "Muy activo",
  },
  {
    id: "construir_otros",
    title: "Construir algo con otros",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=85",
    accent: "#1A9BB0",
  },
  {
    id: "salir_scroll",
    title: "Salir del scroll y hacer algo real",
    image:
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3dbe?w=600&auto=format&fit=crop&q=85",
    accent: "#0B2E59",
  },
  {
    id: "afinidad_dormida",
    title: "Explorar una afinidad dormida",
    image:
      "https://images.unsplash.com/photo-1462275646966-a31f0a2ebac8?w=600&auto=format&fit=crop&q=85",
    accent: "#C6D92D",
  },
  {
    id: "trabajo_emprendimiento",
    title: "Trabajo y emprendimiento",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=85",
    accent: "#0B2E59",
  },
  {
    id: "bienestar_proposito",
    title: "Bienestar y propósito",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=85",
    accent: "#1A9BB0",
    badge: "Muy activo",
  },
  {
    id: "comunidad_pertenencia",
    title: "Comunidad y pertenencia",
    image:
      "https://images.unsplash.com/photo-1529336959819-3da9711c2d2c?w=600&auto=format&fit=crop&q=85",
    accent: "#C6D92D",
  },
  {
    id: "creatividad_expresion",
    title: "Creatividad y expresión",
    image:
      "https://images.unsplash.com/photo-1460668261831-3d5c2bc94841?w=600&auto=format&fit=crop&q=85",
    accent: "#1A9BB0",
  },
];
