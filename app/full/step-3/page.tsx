"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";

export default function Step3Page() {
  const router = useRouter();
  const { answers, setAnswer } = useFullAnswers();

  const [q3, setQ3] = useState(answers.q3);

  useEffect(() => {
    setQ3(answers.q3);
  }, [answers.q3]);

  const handleContinue = () => {
    setAnswer("q3", q3);
    router.push("/full/step-4");
  };

  const handleBack = () => {
    setAnswer("q3", q3);
    router.push("/full/step-2");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl leading-tight font-semibold text-slate-900 sm:text-4xl">
          ¿Sobre qué temas o ideas volvés una y otra vez?
        </h1>

        <div className="mt-6 text-left">
          <textarea
            value={q3}
            className="w-full min-h-[220px] resize-y rounded-lg border border-slate-200 bg-white px-4 py-4 text-slate-900 shadow-sm outline-none transition-colors duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            placeholder="Escribí con calma. No hay respuestas correctas o incorrectas."
            onChange={(e) => setQ3(e.target.value)}
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
            onClick={handleBack}
            className="px-2 py-2 text-base font-semibold text-slate-600 underline decoration-slate-200 transition-colors duration-200 hover:text-slate-900 hover:decoration-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 sm:px-0"
          >
            Volver
          </button>
        </div>
      </div>
    </main>
  );
}

