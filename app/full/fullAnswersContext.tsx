"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type FullAnswers = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
};

const STORAGE_KEY = "second-chance:fullAnswers:v1";

const defaultAnswers: FullAnswers = {
  q1: "",
  q2: "",
  q3: "",
  q4: "",
  q5: ""
};

type FullAnswersContextValue = {
  answers: FullAnswers;
  setAnswer: (key: keyof FullAnswers, value: string) => void;
  reset: () => void;
};

const FullAnswersContext = createContext<FullAnswersContextValue | null>(null);

export function useFullAnswers() {
  const ctx = useContext(FullAnswersContext);
  if (!ctx) throw new Error("useFullAnswers must be used within FullAnswersProvider");
  return ctx;
}

export function FullAnswersProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<FullAnswers>(defaultAnswers);

  useEffect(() => {
    // Load persisted answers so state survives refreshes while in the full flow.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<FullAnswers>;
      setAnswers({
        q1: typeof parsed.q1 === "string" ? parsed.q1 : "",
        q2: typeof parsed.q2 === "string" ? parsed.q2 : "",
        q3: typeof parsed.q3 === "string" ? parsed.q3 : "",
        q4: typeof parsed.q4 === "string" ? parsed.q4 : "",
        q5: typeof parsed.q5 === "string" ? parsed.q5 : ""
      });
    } catch {
      // If parsing fails, keep defaults.
    }
  }, []);

  useEffect(() => {
    // Keep localStorage in sync.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // Ignore storage write errors.
    }
  }, [answers]);

  const value = useMemo<FullAnswersContextValue>(
    () => ({
      answers,
      setAnswer: (key, value) => setAnswers((prev) => ({ ...prev, [key]: value })),
      reset: () => setAnswers(defaultAnswers)
    }),
    [answers]
  );

  return <FullAnswersContext.Provider value={value}>{children}</FullAnswersContext.Provider>;
}

