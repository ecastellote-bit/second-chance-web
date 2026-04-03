"use client";

import { useState } from "react";

const demoPayload = {
  profile: {
    age: 42,
    country: "Argentina",
    language: "es",
    employmentStatus: "employed",
    educationLevel: "university",
    dependents: 2,
  },
  currentContext: {
    currentRole: "Administrative coordinator",
    currentSituation:
      "Estoy trabajando, pero me siento estancado. Tengo responsabilidades económicas y poco margen para improvisar.",
    energyLevel: "medium",
    economicPressure: "high",
    familyLoad: "moderate",
    restrictions: ["Necesito ingresos estables", "No puedo hacer un cambio brusco"],
    assets: ["Experiencia coordinando personas", "Buena comunicación", "Capacidad organizativa"],
    transitionGoal: "Encontrar una dirección más alineada sin romper todo de golpe",
  },
  narrative: {
    childhoodMemories:
      "De chico me gustaba organizar juegos, explicar cosas y coordinar a otros.",
    earlyFascinations:
      "Siempre me interesaron la historia, la sociedad, los idiomas y entender cómo funcionan los grupos.",
    meaningfulSchoolSubjects:
      "Me marcaban historia, lengua y materias donde había que analizar y relacionar ideas.",
    repeatedWorkPatterns:
      "Termino coordinando, resolviendo problemas prácticos y conectando personas o áreas.",
    naturalSocialRoles:
      "Suelo ocupar un lugar de mediación, orden y orientación.",
    lossesOrRenunciations:
      "Fui dejando de lado intereses más intelectuales y de comunicación por necesidad económica.",
    whatFeelsCompressedNow:
      "Siento que mi vida laboral actual me achicó y que hago mucho, pero sin dirección clara.",
    additionalContext:
      "No quiero fantasías. Quiero una lectura seria y movimientos posibles.",
  },
};

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");

  const handleRunDemo = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(demoPayload),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(JSON.stringify({ ok: false, error: "NETWORK_ERROR", detail: String(error) }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Second Chance — Internal MVP</h1>
          <p className="text-sm text-neutral-700">
            Esta pantalla es solo una prueba interna del pipeline lite.
          </p>
        </div>

        <button
          onClick={handleRunDemo}
          disabled={loading}
          className="px-4 py-2 rounded-md border border-black text-sm disabled:opacity-60"
        >
          {loading ? "Analizando..." : "Correr demo interna"}
        </button>

        <pre className="whitespace-pre-wrap text-sm bg-neutral-100 p-4 rounded-lg overflow-x-auto">
          {response || "Todavía no corriste la demo."}
        </pre>
      </div>
    </main>
  );
}