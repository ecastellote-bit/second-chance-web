"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  activateFounderWaveSession,
  getFounderSyncWarning,
  isFounderWaveSession,
} from "@/lib/learning/founderCaseDraftClient";
import {
  ensureFounderDraftStarted,
  syncFounderDraftUpdated,
} from "@/lib/learning/founderCasePreservation";
import { useFullAnswers } from "@/app/full/fullAnswersContext";

let draftUpdateTimer: ReturnType<typeof setTimeout> | null = null;

/** Activa ola fundadora y sincroniza drafts pioneros al servidor (Blob). */
export function FounderWaveBootstrap() {
  const searchParams = useSearchParams();
  const { state, analysis, followup, isHydrated } = useFullAnswers();
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const draftStarted = useRef(false);

  useEffect(() => {
    if (searchParams.get("founder") === "1") {
      activateFounderWaveSession();
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isHydrated || !isFounderWaveSession() || draftStarted.current) return;

    draftStarted.current = true;
    const payload = { state, analysis, followup };
    void ensureFounderDraftStarted(payload);
  }, [isHydrated, state, analysis, followup]);

  useEffect(() => {
    if (!isHydrated || !isFounderWaveSession()) return;

    const payload = { state, analysis, followup };

    if (draftUpdateTimer) clearTimeout(draftUpdateTimer);
    draftUpdateTimer = setTimeout(() => {
      void syncFounderDraftUpdated(payload);
      setSyncWarning(getFounderSyncWarning());
    }, 700);

    return () => {
      if (draftUpdateTimer) clearTimeout(draftUpdateTimer);
    };
  }, [state, analysis, followup, isHydrated]);

  useEffect(() => {
    setSyncWarning(getFounderSyncWarning());
  }, [state]);

  if (!syncWarning || !isFounderWaveSession()) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-3">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        {syncWarning}
      </p>
    </div>
  );
}
