"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import {
  FullFlowActions,
  FullFlowShell,
  FullFlowStepCard,
} from "@/components/full-flow/FullFlowShell";
import { fullFlowTextareaClass } from "@/components/full-flow/fullFlowStyles";
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
    <div className="rounded-[18px] border border-[#E8EEF3] bg-[#F8FAFC] p-4 space-y-4 sm:p-5">
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
          {publicRoundHeading(question.round)}
        </p>
        <h2 className="text-[15px] font-semibold leading-snug text-[#0B2E59]">
          {question.prompt}
        </h2>
        {question.helpText ? (
          <p className="text-[13px] leading-relaxed text-[#6B7A8C]">{question.helpText}</p>
        ) : null}
      </div>

      {isTextQuestion(question.kind) ? (
        <textarea
          value={normalized}
          onChange={(event) => onChange(event.target.value)}
          rows={question.kind === "micro_narrative" ? 5 : 4}
          className={fullFlowTextareaClass}
          placeholder={placeholderForQuestion(question.kind, questionIndex)}
        />
      ) : (
        <div className="space-y-3">
          {(question.options ?? []).map((option) => {
            const checked = normalized === option.id;

            return (
              <label
                key={option.id}
                className="vu-focus flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl border border-[#E8EEF3] bg-white p-4"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={checked}
                  onChange={() => onChange(option.id)}
                  className="mt-1 accent-[#1A9BB0]"
                />
                <span className="text-sm leading-relaxed text-[#243647]">{option.label}</span>
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
        router.replace("/full/result");
        return;
      }

      router.replace("/full");
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

    router.replace("/full/processing");
  };

  if (!isHydrated || isSubmitting || !pack) {
    return (
      <FullFlowShell variant="clarification" maxWidth="lg">
        <FullFlowStepCard>
          <p className="text-sm leading-relaxed text-[#6B7A8C]">
            {isSubmitting
              ? "Actualizando tu lectura con lo que contaste…"
              : "Preparando una aclaración breve para afinar tu devolución…"}
          </p>
        </FullFlowStepCard>
      </FullFlowShell>
    );
  }

  return (
    <FullFlowShell variant="clarification" maxWidth="lg" showPreservationNote>
      <div className="mb-5 space-y-2">
        <p className="text-[12px] font-semibold text-[#6B7A8C]">
          {publicRoundHeading(pack.round)} · Afinar tu lectura
        </p>
        <h1 className="text-[1.5rem] font-bold leading-tight text-[#0B2E59]">{pack.title}</h1>
        <p className="text-[15px] leading-relaxed text-[#6B7A8C]">{pack.objective}</p>
        <p className="rounded-xl border border-[#C6D92D]/35 bg-[#F4F9E0]/80 px-4 py-3 text-[13px] text-[#243647]">
          No hace falta escribir perfecto. Una escena concreta alcanza.
        </p>
      </div>

      <FullFlowStepCard>
        <p className="text-sm font-semibold text-[#0B2E59]">{FOLLOWUP_UI.whyAsking}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
          {humanizeFollowupReason(currentFollowup?.reason ?? "")}
        </p>
        {rivalryLine ? (
          <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">{rivalryLine}</p>
        ) : null}
      </FullFlowStepCard>

      <div className="mt-5 space-y-4">
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
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      ) : null}

      <FullFlowActions
        backLabel={FOLLOWUP_UI.back}
        nextLabel={isSubmitting ? FOLLOWUP_UI.continueLoading : "Continuar mi lectura"}
        onBack={() => {
          if (isSubmitting) return;
          router.push("/full/step-5");
        }}
        onNext={handleContinue}
        nextDisabled={isSubmitting}
      />
    </FullFlowShell>
  );
}