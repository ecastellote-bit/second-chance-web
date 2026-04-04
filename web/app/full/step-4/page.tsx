"use client";

import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";

export default function FullStep4Page() {
  const router = useRouter();
  const { state, updateCurrentContext } = useFullAnswers();

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-neutral-500">Paso 4 de 5</p>
          <h1 className="text-2xl font-semibold">Restricciones y activos actuales</h1>
          <p className="text-sm text-neutral-700">
            El sistema tiene que leer también con qué margen real contás hoy.
          </p>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium">
              Restricciones actuales
            </span>
            <textarea
              value={state.currentContext.restrictionsText}
              onChange={(e) =>
                updateCurrentContext("restrictionsText", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
              placeholder="Una por línea o separadas por comas"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              Activos actuales
            </span>
            <textarea
              value={state.currentContext.assetsText}
              onChange={(e) =>
                updateCurrentContext("assetsText", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
              placeholder="Experiencia, contactos, habilidades, credibilidad, herramientas, etc."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              Objetivo de transición
            </span>
            <textarea
              value={state.currentContext.transitionGoal}
              onChange={(e) =>
                updateCurrentContext("transitionGoal", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-24"
              placeholder="¿Qué tipo de movimiento te gustaría poder hacer sin romper todo?"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/full/step-3")}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            Volver
          </button>

          <button
            onClick={() => router.push("/full/step-5")}
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            Guardar y seguir
          </button>
        </div>
      </div>
    </main>
  );
}