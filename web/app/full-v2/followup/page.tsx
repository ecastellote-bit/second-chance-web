"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import {
  describeFollowupRivalry,
  FOLLOWUP_UI,
  humanizeFollowupPack,
  humanizeFollowupReason,
  placeholderForQuestion,
  publicRoundHeading,
} from "@/lib/content/followupPublicCopy";

type FollowupOption = {
  id: string;
  label: string;
  leansToward?: string[];
};

type FollowupQuestion = {
  id: string;
  round: 2 | 3;
  ambiguityType: string;
  kind: "open_text" | "contrast_choice" | "forced_choice" | "micro_narrative";
  prompt: string;
  helpText?: string;
  options?: FollowupOption[];
};

type FollowupPack = {
  ambiguityType: string;
  round: 2 | 3;
  title: string;
  objective: string;
  questions: FollowupQuestion[];
};

type FollowupAssessment = {
  needsFollowupRound: boolean;
  recommendedRound: 2 | 3 | null;
  ambiguityType: string | null;
  candidateProfiles: string[];
  questionStrategy: string;
  reason: string;
  signalCount: number;
  topProfileId: string | null;
  topProfileLabel: string | null;
  topProfileConfidence: number | null;
  secondProfileId: string | null;
  secondProfileLabel: string | null;
  secondProfileConfidence: number | null;
  confidenceGap: number | null;
  allowForcedAdjudicationAfterRound2: boolean;
};

type FollowupOrchestratorResult = {
  shouldAskFollowup: boolean;
  round: 2 | 3 | null;
  ambiguityType: string | null;
  pack: FollowupPack | null;
  assessment: FollowupAssessment;
  status:
    | "no_followup_needed"
    | "round_ready"
    | "no_pack_available"
    | "round_not_allowed";
  reason: string;
};

type FollowupAnswerValue = string | string[];

function isTextQuestion(kind: FollowupQuestion["kind"]): boolean {
  return kind === "open_text" || kind === "micro_narrative";
}

function normalizeAnswer(value: FollowupAnswerValue | undefined): string {
  if (Array.isArray(value)) {
    return value.join(" | ");
  }

  return typeof value === "string" ? value : "";
}

function hasMeaningfulAnswer(value: FollowupAnswerValue | undefined): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => item.trim().length > 0);
  }

  return typeof value === "string" && value.trim().length > 0;
}

function QuestionCard({
  question,
  value,
  onChange,
  questionIndex,
}: {
  question: FollowupQuestion;
  value: FollowupAnswerValue | undefined;
  onChange: (value: string) => void;
  questionIndex: number;
}) {
  const normalized = normalizeAnswer(value);

  return (
    <div className="rounded-2xl border border-neutral-200 p-5 space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {publicRoundHeading(question.round)}
        </p>
        <h2 className="text-base font-medium">{question.prompt}</h2>
        {question.helpText ? (
          <p className="text-sm text-neutral-600">{question.helpText}</p>
        ) : null}
      </div>

      {isTextQuestion(question.kind) ? (
        <textarea
          value={normalized}
          onChange={(event) => onChange(event.target.value)}
          rows={question.kind === "micro_narrative" ? 5 : 4}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
          placeholder={placeholderForQuestion(question.kind, questionIndex)}
        />
      ) : (
        <div className="space-y-3">
          {(question.options ?? []).map((option) => {
            const checked = normalized === option.id;

            return (
              <label
                key={option.id}
                className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={checked}
                  onChange={() => onChange(option.id)}
                  className="mt-1"
                />
                <span className="text-sm text-neutral-800">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FullFollowupPage() {
  const router = useRouter();
  const {
    followup,
    analysis,
    isHydrated,
    updateFollowupAnswer,
    commitFollowupRound,
    clearAnalysis,
  } = useFullAnswers();

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentFollowup = followup.current as FollowupOrchestratorResult | null;
  const rawPack = currentFollowup?.pack ?? null;
  const pack = useMemo(
    () => (rawPack ? humanizeFollowupPack(rawPack) : null),
    [rawPack],
  );
  const rivalryLine = useMemo(
    () =>
      describeFollowupRivalry({
        ambiguityType: currentFollowup?.ambiguityType,
        candidateProfiles: currentFollowup?.assessment?.candidateProfiles,
      }),
    [currentFollowup?.ambiguityType, currentFollowup?.assessment?.candidateProfiles],
  );

  useEffect(() => {
    if (!isHydrated || isSubmitting) return;

    if (!pack) {
      if (analysis.result) {
        router.replace("/full-v2/result");
        return;
      }

      router.replace("/full-v2");
    }
  }, [analysis.result, isHydrated, isSubmitting, pack, router]);

  const unansweredQuestions = useMemo(() => {
    if (!pack) return [];

    return pack.questions.filter(
      (question) => !hasMeaningfulAnswer(followup.answers[question.id]),
    );
  }, [followup.answers, pack]);

  const handleContinue = () => {
    if (!pack || isSubmitting) return;

    if (unansweredQuestions.length > 0) {
      setErrorMessage(FOLLOWUP_UI.errorIncomplete);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    flushSync(() => {
      commitFollowupRound();
      clearAnalysis();
    });

    router.replace("/full-v2/processing");
  };

  if (!isHydrated || isSubmitting || !pack) {
    return (
      <main className="min-h-screen bg-white text-black px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl border border-neutral-200 p-5 text-sm text-neutral-700">
            {isSubmitting
              ? "Procesando nueva lectura..."
              : "Preparando ronda de clarificación..."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            {publicRoundHeading(pack.round)} · Clarificación
          </p>
          <h1 className="text-3xl font-semibold">{pack.title}</h1>
          <p className="text-sm text-neutral-700">{pack.objective}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 p-5 space-y-3">
          <p className="text-sm font-medium">{FOLLOWUP_UI.whyAsking}</p>
          <p className="text-sm text-neutral-700">
            {humanizeFollowupReason(currentFollowup?.reason ?? "")}
          </p>

          {rivalryLine ? (
            <p className="text-sm text-neutral-700">{rivalryLine}</p>
          ) : null}
        </div>

        <div className="space-y-5">
          {pack.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionIndex={index}
              value={followup.answers[question.id]}
              onChange={(value) => updateFollowupAnswer(question.id, value)}
            />
          ))}
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isSubmitting) return;
              router.push("/full-v2/step-5");
            }}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm disabled:opacity-50"
          >
            {FOLLOWUP_UI.back}
          </button>

          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md border border-black text-sm disabled:opacity-50"
          >
            {isSubmitting ? FOLLOWUP_UI.continueLoading : FOLLOWUP_UI.continue}
          </button>
        </div>
      </div>
    </main>
  );
}
