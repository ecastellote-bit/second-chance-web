"use client";

import { useEffect, useState } from "react";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import type { FounderSeedStory } from "@/lib/content/fundadorLandingV2Copy";

const SLOT_COUNT = 3;
const FADE_MS = 700;
const BASE_INTERVAL_MS = 6100;

function nextIndex(current: number, total: number): number {
  return (current + 1) % total;
}

function tickMs(slot: number): number {
  return BASE_INTERVAL_MS + slot * 180 + Math.floor(Math.random() * 500);
}

type SlotState = {
  storyIndex: number;
  opaque: boolean;
};

type StoryCardProps = {
  story: FounderSeedStory;
  opaque: boolean;
};

function StoryCard({ story, opaque }: StoryCardProps) {
  return (
    <article className="relative min-h-[16rem] overflow-hidden rounded-2xl border border-white/10 bg-[#0B2E59]/40 shadow-[0_8px_28px_rgba(0,0,0,0.28)] sm:min-h-[17rem]">
      <div
        className={[
          "absolute inset-0 transition-opacity duration-700 ease-in-out",
          opaque ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden={!opaque}
      >
        <VuWarmImage
          src={story.image}
          fallbackSrc={story.fallbackImage}
          alt=""
          fill
          className="object-cover object-[center_10%]"
          sizes="34vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071018] from-[38%] via-[#071018]/58 via-[52%] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3 pt-5">
          <p className="text-[14px] font-bold leading-tight text-white">{story.name}</p>
          <p className="mt-1 text-[12px] font-semibold leading-snug text-[#C6D92D]/95">
            {story.beforeToday}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-white/88 line-clamp-3">
            &ldquo;{story.quote}&rdquo;
          </p>
        </div>
      </div>
    </article>
  );
}

type Props = {
  stories: FounderSeedStory[];
  title: string;
  disclaimer: string;
};

function initialSlots(total: number): SlotState[] {
  return Array.from({ length: SLOT_COUNT }, (_, slot) => ({
    storyIndex: slot % total,
    opaque: true,
  }));
}

export function FounderStoryRotator({ stories, title, disclaimer }: Props) {
  const total = stories.length;
  const [slots, setSlots] = useState<SlotState[]>(() => initialSlots(total));

  useEffect(() => {
    if (total < SLOT_COUNT) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function scheduleSlot(slot: number) {
      const delay = tickMs(slot);
      const timeoutId = setTimeout(() => {
        setSlots((prev) =>
          prev.map((entry, index) =>
            index === slot ? { ...entry, opaque: false } : entry,
          ),
        );

        const fadeOut = setTimeout(() => {
          setSlots((prev) =>
            prev.map((entry, index) => {
              if (index !== slot) return entry;
              return {
                storyIndex: nextIndex(entry.storyIndex, total),
                opaque: true,
              };
            }),
          );
          scheduleSlot(slot);
        }, FADE_MS);

        timeouts.push(fadeOut);
      }, delay);

      timeouts.push(timeoutId);
    }

    for (let slot = 0; slot < SLOT_COUNT; slot += 1) {
      scheduleSlot(slot);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [total]);

  return (
    <section className="px-4 py-6" aria-label={title}>
      <div className="mx-auto max-w-lg">
        <h2 className="text-[17px] font-bold leading-snug text-white">{title}</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-white/45">{disclaimer}</p>

        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          {slots.map((slot, index) => {
            const story = stories[slot.storyIndex]!;
            return (
              <StoryCard
                key={`slot-${index}`}
                story={story}
                opaque={slot.opaque}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
