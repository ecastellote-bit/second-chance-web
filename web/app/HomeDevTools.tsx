"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, PageHeader, PageShell } from "@/components/ui";

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
    naturalSocialRoles: "Suelo ocupar un lugar de mediación, orden y orientación.",
    lossesOrRenunciations:
      "Fui dejando de lado intereses más intelectuales y de comunicación por necesidad económica.",
    whatFeelsCompressedNow:
      "Siento que mi vida laboral actual me achicó y que hago mucho, pero sin dirección clara.",
    additionalContext:
      "No quiero fantasías. Quiero una lectura seria y movimientos posibles.",
  },
};

/** Herramientas de taller — sólo desarrollo local (no enlazada en producción). */
export default function HomeDevTools() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleRunDemo = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoPayload),
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(
        JSON.stringify(
          { ok: false, error: "NETWORK_ERROR", detail: String(error) },
          null,
          2,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="VocationUp · taller interno"
        title="Herramientas de desarrollo"
        description="Accesos rápidos para validación local. En producción la entrada pública es /fundador."
      />

      <Card variant="elevated" className="space-y-4">
        <p className="vu-prose">
          Accesos para taller y validación. No compartir esta URL con pioneros.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/comenzar">
            <Button variant="primary" size="md" showArrow>
              Recorrido inicial — Comenzar
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button variant="secondary" size="md">
              Onboarding — 3 puertas
            </Button>
          </Link>
          <Link href="/tematicas">
            <Button variant="secondary" size="md">
              Temáticas
            </Button>
          </Link>
          <Link href="/activacion">
            <Button variant="secondary" size="md">
              Activación
            </Button>
          </Link>
          <Link href="/plaza">
            <Button variant="secondary" size="md">
              Plaza inicial
            </Button>
          </Link>
          <Link href="/fundador">
            <Button variant="secondary" size="md">
              Invitación fundadora
            </Button>
          </Link>
          <Link href="/design-system">
            <Button variant="secondary" size="md">
              Design system
            </Button>
          </Link>
          <Link href="/full/step-1">
            <Button variant="primary">Iniciar flujo completo</Button>
          </Link>
          <Link href="/lab">
            <Button variant="ghost">
              Lab
            </Button>
          </Link>
          <Link href="/admin/observatorio">
            <Button variant="ghost">Observatorio</Button>
          </Link>
        </div>
        <Button variant="secondary" onClick={handleRunDemo} disabled={loading}>
          {loading ? "Analizando..." : "Correr demo API (dev)"}
        </Button>
      </Card>

      {response ? (
        <Card variant="muted">
          <pre className="whitespace-pre-wrap text-xs font-mono text-vu-graphite-muted overflow-x-auto max-h-96">
            {response}
          </pre>
        </Card>
      ) : null}
    </PageShell>
  );
}
