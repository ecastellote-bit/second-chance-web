"use client";

import {
  COMMUNITY_EXAMPLE_CONVERSATIONS_LABEL,
  type CooperativeVoiceExample,
} from "@/lib/content/cooperativeSeedExamples";

function VoiceBubble({ voice }: { voice: CooperativeVoiceExample }) {
  return (
    <article className="flex gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: voice.accent }}
        aria-hidden
      >
        {voice.initials}
      </span>
      <div className="min-w-0 flex-1 rounded-[20px] rounded-tl-md border border-[#E8EEF3] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(15,42,70,0.06)]">
        <p className="text-sm font-bold text-[#0B2E59]">{voice.author}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-[#6B7A8C]">{voice.body}</p>
      </div>
    </article>
  );
}

type Props = {
  title: string;
  intro: string;
  examples: CooperativeVoiceExample[];
  className?: string;
};

export function CooperativeExampleVoices({ title, intro, examples, className = "" }: Props) {
  return (
    <section
      className={[
        "rounded-[24px] border border-[#E8EEF3] bg-[#F8FAFC] p-4",
        className,
      ].join(" ")}
    >
      <h2 className="text-[16px] font-bold text-[#0B2E59]">{title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{intro}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {examples.map((voice) => (
          <li key={voice.id}>
            <VoiceBubble voice={voice} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[#6B7A8C]">
        {COMMUNITY_EXAMPLE_CONVERSATIONS_LABEL}
      </p>
    </section>
  );
}
