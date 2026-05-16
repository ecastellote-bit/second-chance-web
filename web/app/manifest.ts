import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VocationUp by Second Chance",
    short_name: "VocationUp",
    description:
      "Un neighborhood para ordenar tu camino vocacional, conectar y construir con otros.",
    start_url: "/onboarding",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#0B2E59",
    orientation: "portrait-primary",
    lang: "es",
    categories: ["education", "social"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
