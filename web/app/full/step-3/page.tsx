"use client";

import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";

export default function FullStep3Page() {
  const router = useRouter();
  const { state, updateNarrative } = useFullAnswers();

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-neutral-500">Paso 3 de 5</p>
          <h1 className="text-2xl font-semibold">Pérdidas, renuncias y compresión</h1>
          <p className="text-sm text-neutral-700">
            Acá importa detectar qué se fue apagando y qué parte de tu vida actual te redujo.
          </p>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium">
              ¿Qué fuiste dejando de lado por necesidad, cansancio o adaptación?
            </span>
            <textarea
              value={state.narrative.lossesOrRenunciations}
              onChange={(e) =>
                updateNarrative("lossesOrRenunciations", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-32"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              ¿Qué sentís hoy más comprimido o achicado en tu vida laboral?
            </span>
            <textarea
              value={state.narrative.whatFeelsCompressedNow}
              onChange={(e) =>
                updateNarrative("whatFeelsCompressedNow", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-32"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/full/step-2")}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            Volver
          </button>

          <button
            onClick={() => router.push("/full/step-4")}
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            Guardar y seguir
          </button>
        </div>
      </div>
    </main>
  );
}