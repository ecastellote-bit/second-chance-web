"use client";

import { useEffect, useState } from "react";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import type { FounderSeedStory } from "@/lib/content/fundadorLandingV2Copy";

const SLOT_COUNT = 3;

function nextIndex(current: number, total: number): number {
  return (current + 1) % total;
}

function tickMs(slot: number): number {
  return 5000 + slot * 180 + Math.floor(Math.random() * 500);
}

type StoryCardProps = {
  story: FounderSeedStory;
  visible: boolean;
};

function StoryCard({ story, visible }: StoryCardProps) {
  return (
    <article className="relative min-h-[15.5rem] overflow-hidden rounded-2xl border border-white/10 bg-[#0B2E59]/40 shadow-[0_8px_28px_rgba(0,0,0,0.28)] sm:min-h-[16.5rem]">
      <VuWarmImage
        src={story.image}
        fallbackSrc={story.fallbackImage}
        alt=""
        fill
        className="object-cover object-[center_20%] transition-opacity duration-700"
        sizes="34vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071018] via-[#071018]/72 to-[#071018]/15" />
      <div
        className={[
          "absolute inset-x-0 bottom-0 px-3.5 pb-3.5 pt-10 transition-opacity duration-700",
          visible ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <p className="text-[14px] font-bold leading-tight text-white">{story.name}</p>
        <p className="mt-1 text-[12px] font-semibold leading-snug text-[#C6D92D]/95">
          {story.beforeToday}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-white/88 line-clamp-3">
          &ldquo;{story.quote}&rdquo;
        </p>
      </div>
    </article>
  );
}

type Props = {
  stories: FounderSeedStory[];
  title: string;
  disclaimer: string;
};

export function FounderStoryRotator({ stories, title, disclaimer }: Props) {
  const total = stories.length;
  const [indices, setIndices] = useState([0, 1, 2]);
  const [visible, setVisible] = useState([true, true, true]);

  useEffect(() => {
    if (total < SLOT_COUNT) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function scheduleSlot(slot: number) {
      const delay = tickMs(slot);
      const timeoutId = setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[slot] = false;
          return next;
        });

        const fadeOut = setTimeout(() => {
          setIndices((prev) => {
            const next = [...prev];
            next[slot] = nextIndex(prev[slot]!, total);
            return next;
          });
          setVisible((prev) => {
            const next = [...prev];
            next[slot] = true;
            return next;
          });
          scheduleSlot(slot);
        }, 380);

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
          {indices.map((storyIndex, slot) => (
            <StoryCard
              key={slot}
              story={stories[storyIndex]!}
              visible={visible[slot]!}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
