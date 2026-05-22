"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";
import {
  getP0Preset,
  type VuAtmospherePresetKey,
  type VuHeroPreset,
} from "@/lib/content/vuAtmosphereCatalog";

type Props = {
  preset: VuAtmospherePresetKey;
  className?: string;
};

function isHero(p: ReturnType<typeof getP0Preset>): p is VuHeroPreset {
  return p.kind === "hero";
}

/**
 * Hero focal 4:5 con gradiente cálido (puerta / bienvenida).
 */
export function VuHeroImage({ preset, className = "" }: Props) {
  const config = getP0Preset(preset);
  if (!isHero(config)) return null;

  const { src, fallbackSrc, objectPosition, aspectClass, maxHeightPx } = config;

  return (
    <div
      className={[
        "relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[28px]",
        "shadow-[0_8px_32px_rgba(11,46,89,0.12)]",
        aspectClass,
        className,
      ].join(" ")}
      style={{ maxHeight: maxHeightPx }}
    >
      <VuWarmImage
        src={src}
        fallbackSrc={fallbackSrc}
        alt=""
        fill
        priority
        className="object-cover"
        style={{ objectPosition }}
        sizes="(max-width: 420px) 100vw, 340px"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(26,155,176,0.2) 0%, transparent 38%, rgba(11,46,89,0.42) 100%)",
        }}
      />
    </div>
  );
}
