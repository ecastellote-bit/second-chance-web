"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

/** Respaldo local — misma línea visual que la plaza */
export const VU_WARM_IMAGE_FALLBACK = "/vu/plaza-inicial.png";

type VuWarmImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt?: string;
  /** Si falla `src`, intenta esta ruta antes del fallback global */
  fallbackSrc?: string;
};

/**
 * Imagen remota con respaldo si la URL falla (404, red, etc.).
 * `unoptimized` evita depender del optimizador de Next en desarrollo.
 */
export function VuWarmImage({
  src,
  alt = "",
  fallbackSrc,
  unoptimized = true,
  onError,
  ...props
}: VuWarmImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized}
      onError={(e) => {
        if (currentSrc === src) {
          setCurrentSrc(fallbackSrc ?? VU_WARM_IMAGE_FALLBACK);
        } else if (fallbackSrc && currentSrc === fallbackSrc) {
          setCurrentSrc(VU_WARM_IMAGE_FALLBACK);
        } else if (currentSrc !== VU_WARM_IMAGE_FALLBACK) {
          setCurrentSrc(VU_WARM_IMAGE_FALLBACK);
        }
        onError?.(e);
      }}
    />
  );
}
