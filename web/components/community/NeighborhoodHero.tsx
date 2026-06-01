"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  imageSrc?: string;
  className?: string;
};

export function NeighborhoodHero({
  eyebrow,
  title,
  subtitle,
  imageSrc,
  className = "",
}: Props) {
  return (
    <section
      className={[
        "mb-6 overflow-hidden rounded-[28px] bg-white shadow-[0_4px_16px_rgba(15,42,70,0.06)] ring-1 ring-[#E8EEF3]",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="min-w-0 flex-1 p-5 sm:p-6">
          {eyebrow ? (
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 text-[1.65rem] font-bold tracking-tight text-[#0B2E59] sm:text-[1.75rem]">
            {title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#6B7A8C]">{subtitle}</p>
        </div>
        {imageSrc ? (
          <div className="relative h-36 w-full shrink-0 sm:h-auto sm:w-44 md:w-52">
            <VuWarmImage
              src={imageSrc}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 208px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/30 to-transparent sm:bg-gradient-to-l sm:from-transparent sm:via-white/20 sm:to-white/80" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
