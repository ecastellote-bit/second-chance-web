"use client";

import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";

export default function FullStep2Page() {
  const router = useRouter();
  const { state, updateNarrative } = useFullAnswers();

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-neutral-500">Paso 2 de 5</p>
          <h1 className="text-2xl font-semibold">Memoria vocacional inicial</h1>
          <p className="text-sm text-neutral-700">
            No busques quedar bien. Buscá hechos, patrones y recuerdos concretos.
          </p>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium">
              ¿Qué te gustaba hacer de chico/a sin que nadie te lo pidiera?
            </span>
            <textarea
              value={state.narrative.childhoodMemories}
              onChange={(e) =>
                updateNarrative("childhoodMemories", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              ¿Qué te fascinaba o te atraía de forma persistente?
            </span>
            <textarea
              value={state.narrative.earlyFascinations}
              onChange={(e) =>
                updateNarrative("earlyFascinations", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              ¿Qué materias o experiencias educativas te dejaban algo?
            </span>
            <textarea
              value={state.narrative.meaningfulSchoolSubjects}
              onChange={(e) =>
                updateNarrative("meaningfulSchoolSubjects", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              ¿Qué patrones se repiten en tus trabajos o actividades?
            </span>
            <textarea
              value={state.narrative.repeatedWorkPatterns}
              onChange={(e) =>
                updateNarrative("repeatedWorkPatterns", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              ¿Qué lugar solés ocupar naturalmente entre otras personas?
            </span>
            <textarea
              value={state.narrative.naturalSocialRoles}
              onChange={(e) =>
                updateNarrative("naturalSocialRoles", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
            />
          </label>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Hasta acá dejamos armado el estado compartido y las dos primeras
          pantallas. En el próximo bloque seguimos con los pasos 3, 4, 5 y el
          envío al pipeline real.
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/full/step-1")}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            Volver
          </button>

          <button
            disabled
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm opacity-60 cursor-not-allowed"
          >
            Paso 3 en el próximo bloque
          </button>
        </div>
      </div>
    </main>
  );
}