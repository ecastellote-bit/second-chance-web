"use client";

import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";

export default function FullStep1Page() {
  const router = useRouter();
  const { state, updateProfile, updateCurrentContext, clearAnalysis } =
    useFullAnswers();

  const handleNext = () => {
    clearAnalysis();
    router.push("/full/step-2");
  };

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-neutral-500">Paso 1 de 5</p>
          <h1 className="text-2xl font-semibold">Tu situación actual</h1>
          <p className="text-sm text-neutral-700">
            Acá no busques lucirte. Buscá precisión.
          </p>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Edad</span>
            <input
              value={state.profile.age}
              onChange={(e) => updateProfile("age", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Ej: 42"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">País</span>
            <input
              value={state.profile.country}
              onChange={(e) => updateProfile("country", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Ej: Argentina"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Situación laboral</span>
            <select
              value={state.profile.employmentStatus}
              onChange={(e) =>
                updateProfile("employmentStatus", e.target.value as any)
              }
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="employed">Empleado/a</option>
              <option value="unemployed">Desempleado/a</option>
              <option value="self_employed">Independiente</option>
              <option value="between_roles">Entre roles</option>
              <option value="caregiving">Cuidados</option>
              <option value="student">Estudiante</option>
              <option value="other">Otro</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Rol actual</span>
            <input
              value={state.currentContext.currentRole}
              onChange={(e) => updateCurrentContext("currentRole", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
              placeholder="Ej: Administrativo, ventas, docencia, etc."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Situación actual</span>
            <textarea
              value={state.currentContext.currentSituation}
              onChange={(e) =>
                updateCurrentContext("currentSituation", e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm min-h-28"
              placeholder="Describí dónde estás parado hoy, sin épica y sin maquillaje."
            />
          </label>

          <div className="grid md:grid-cols-3 gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Energía disponible</span>
              <select
                value={state.currentContext.energyLevel}
                onChange={(e) =>
                  updateCurrentContext("energyLevel", e.target.value as any)
                }
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="very_low">Muy baja</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Presión económica</span>
              <select
                value={state.currentContext.economicPressure}
                onChange={(e) =>
                  updateCurrentContext("economicPressure", e.target.value as any)
                }
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="very_high">Muy alta</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Carga familiar/práctica</span>
              <select
                value={state.currentContext.familyLoad}
                onChange={(e) =>
                  updateCurrentContext("familyLoad", e.target.value as any)
                }
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="heavy">Pesada</option>
                <option value="moderate">Moderada</option>
                <option value="light">Ligera</option>
                <option value="none">Ninguna</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/full")}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            Volver
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            Guardar y seguir
          </button>
        </div>
      </div>
    </main>
  );
}