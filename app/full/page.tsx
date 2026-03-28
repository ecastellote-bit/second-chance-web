"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "./fullAnswersContext";

export default function FullPage() {
  const router = useRouter();
  const { answers, setAnswer } = useFullAnswers();

  const [q1, setQ1] = useState(answers.q1);

  useEffect(() => {
    setQ1(answers.q1);
  }, [answers.q1]);

  const handleContinue = () => {
    setAnswer("q1", q1);
    router.push("/full/step-2");
  };

  const handleBackHome = () => {
    setAnswer("q1", q1);
    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl leading-tight font-semibold text-slate-900 sm:text-4xl">
          ¿Qué te gustaba hacer de chico/a sin que nadie te lo pidiera?
        </h1>

        <div className="mt-6 text-left">
          <textarea
            value={q1}
            className="w-full min-h-[220px] resize-y rounded-lg border border-slate-200 bg-white px-4 py-4 text-slate-900 shadow-sm outline-none transition-colors duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            placeholder="Escribí con calma. No hay respuestas correctas o incorrectas."
            onChange={(e) => setQ1(e.target.value)}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={handleContinue}
            className="rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          >
            Continuar
          </button>

          <button
            type="button"
            onClick={handleBackHome}
            className="px-2 py-2 text-base font-semibold text-slate-600 underline decoration-slate-200 transition-colors duration-200 hover:text-slate-900 hover:decoration-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 sm:px-0"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </main>
  );
}

