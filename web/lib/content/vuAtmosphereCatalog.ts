/**
 * Fotos de referencia VocationUp (P0).
 * Fotos en web/public/vu/ (JPEG desde incoming).
 * Mientras falten, VuWarmImage usa fallbackSrc (assets actuales).
 */
export const VU_PHOTO_ASSETS = {
  puertaAbiertaBienvenida: "/vu/puerta-abierta-bienvenida.jpeg",
  patioVivoEscenaCoral: "/vu/patio-vivo-escena-coral.jpeg",
  llegadaSilenciosaPatio: "/vu/llegada-silenciosa-patio.jpeg",
  mesaDeReflexion: "/vu/mesa-de-reflexion.jpeg",
  cuadernoCaminoSereno: "/vu/cuaderno-camino-sereno.jpeg",
  pausaEnElBanco: "/vu/pausa-en-el-banco.jpeg",
} as const;

export type VuHeroPreset = {
  kind: "hero";
  src: string;
  fallbackSrc: string;
  objectPosition: string;
  /** Tailwind aspect ratio class */
  aspectClass: string;
  maxHeightPx: number;
};

export type VuBandPreset = {
  kind: "band";
  src: string;
  fallbackSrc: string;
  objectPosition: string;
  opacity: number;
  blurPx: number;
  bandHeightPx: number;
  variant: "full" | "corner-tr";
};

export type VuAtmospherePresetKey =
  | "fundador"
  | "activacion"
  | "profileCreate"
  | "profileEdit"
  | "fullIntro"
  | "fullProcessing";

export const VU_P0_ATMOSPHERE: Record<VuAtmospherePresetKey, VuHeroPreset | VuBandPreset> = {
  fundador: {
    kind: "hero",
    src: VU_PHOTO_ASSETS.puertaAbiertaBienvenida,
    fallbackSrc: "/vu/puerta-conectar-otros.png",
    objectPosition: "center",
    aspectClass: "aspect-[4/5]",
    maxHeightPx: 320,
  },
  activacion: {
    kind: "band",
    src: VU_PHOTO_ASSETS.patioVivoEscenaCoral,
    fallbackSrc: "/vu/plaza-inicial.png",
    objectPosition: "center",
    opacity: 0.42,
    blurPx: 18,
    bandHeightPx: 220,
    variant: "full",
  },
  profileCreate: {
    kind: "band",
    src: VU_PHOTO_ASSETS.llegadaSilenciosaPatio,
    fallbackSrc: "/vu/plaza-inicial.png",
    objectPosition: "right center",
    opacity: 0.19,
    blurPx: 34,
    bandHeightPx: 160,
    variant: "corner-tr",
  },
  profileEdit: {
    kind: "band",
    src: VU_PHOTO_ASSETS.mesaDeReflexion,
    fallbackSrc: "/vu/tema-reordenar-camino.png",
    objectPosition: "right center",
    opacity: 0.16,
    blurPx: 28,
    bandHeightPx: 140,
    variant: "corner-tr",
  },
  fullIntro: {
    kind: "band",
    src: VU_PHOTO_ASSETS.cuadernoCaminoSereno,
    fallbackSrc: "/vu/tema-escribir-crear.png",
    objectPosition: "left bottom",
    opacity: 0.18,
    blurPx: 28,
    bandHeightPx: 150,
    variant: "full",
  },
  fullProcessing: {
    kind: "band",
    src: VU_PHOTO_ASSETS.pausaEnElBanco,
    fallbackSrc: "/vu/tema-bienestar-proposito.png",
    objectPosition: "right center",
    opacity: 0.22,
    blurPx: 36,
    bandHeightPx: 180,
    variant: "full",
  },
};

export function getP0Preset(key: VuAtmospherePresetKey) {
  return VU_P0_ATMOSPHERE[key];
}
