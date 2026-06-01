"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";

type Props = {
  src: string;
  alt?: string;
  /** Card thumbnail vs full-width hero */
  variant?: "card" | "hero";
  className?: string;
  priority?: boolean;
};

export function ProjectCover({
  src,
  alt = "",
  variant = "card",
  className = "",
  priority = false,
}: Props) {
  if (variant === "hero") {
    return (
      <div className={["relative h-[min(42vh,320px)] w-full shrink-0 overflow-hidden", className].join(" ")}>
        <VuWarmImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,46,89,0.2) 0%, rgba(11,46,89,0.45) 55%, rgba(11,46,89,0.82) 100%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className={["relative h-36 w-full shrink-0 overflow-hidden sm:h-40", className].join(" ")}>
      <VuWarmImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 400px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E59]/50 via-transparent to-transparent" />
    </div>
  );
}
