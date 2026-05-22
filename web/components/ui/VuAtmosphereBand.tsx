"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";
import {
  getP0Preset,
  type VuAtmospherePresetKey,
  type VuBandPreset,
} from "@/lib/content/vuAtmosphereCatalog";

type Props = {
  preset: VuAtmospherePresetKey;
  className?: string;
};

function isBand(p: ReturnType<typeof getP0Preset>): p is VuBandPreset {
  return p.kind === "band";
}

/**
 * Banda difuminada de atmósfera (P0). No tapa el contenido: va detrás con gradiente a #F8FAFC.
 */
export function VuAtmosphereBand({ preset, className = "" }: Props) {
  const config = getP0Preset(preset);
  if (!isBand(config)) return null;

  const { src, fallbackSrc, objectPosition, opacity, blurPx, bandHeightPx, variant } = config;

  const positionClasses =
    variant === "corner-tr"
      ? "right-0 top-0 w-[58%] max-w-[240px]"
      : "inset-x-0 top-0 w-full";

  return (
    <div
      className={["pointer-events-none absolute z-0 overflow-hidden", positionClasses, className].join(
        " ",
      )}
      style={{ height: bandHeightPx }}
      aria-hidden
    >
      <div className="relative h-full w-full">
        <div
          className="absolute inset-0 scale-110 overflow-hidden"
          style={{ filter: `blur(${blurPx}px)` }}
        >
          <VuWarmImage
            src={src}
            fallbackSrc={fallbackSrc}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition, opacity }}
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              variant === "corner-tr"
                ? "linear-gradient(105deg, #F8FAFC 0%, rgba(248,250,252,0.75) 42%, rgba(248,250,252,0.2) 100%)"
                : preset === "activacion"
                  ? "linear-gradient(180deg, rgba(248,250,252,0.05) 0%, rgba(248,250,252,0.45) 50%, #F8FAFC 85%)"
                  : "linear-gradient(180deg, rgba(248,250,252,0.25) 0%, #F8FAFC 72%)",
          }}
        />
      </div>
    </div>
  );
}
