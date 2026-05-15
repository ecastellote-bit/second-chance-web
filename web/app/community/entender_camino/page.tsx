"use client";

import Link from "next/link";

export default function EntenderCaminoPage() {
  return (
    <main className="min-h-screen bg-amber-50 text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <Link
            href="/community"
            className="text-sm text-neutral-500 underline"
          >
            Volver a las puertas
          </Link>
          <h1 className="text-3xl font-semibold">Entender mi camino</h1>
          <p className="text-base text-neutral-700 leading-7">
            Formaciones, recursos y experiencias de aprendizaje alineadas con tu
            perfil vocacional.
          </p>
        </div>

        <section className="border border-amber-200 bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium">Formaciones disponibles</h2>
          <p className="text-sm text-neutral-600">
            Próximamente: cursos cortos, talleres y rutas de aprendizaje curadas
            para tu perfil.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">Exploración guiada</p>
              <p className="text-xs text-neutral-600">
                Un recorrido de 2 semanas para explorar tu dirección sin
                comprometerte con nada definitivo.
              </p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">Micro-formación temática</p>
              <p className="text-xs text-neutral-600">
                Módulos breves sobre áreas específicas que resonaron en tu
                diagnóstico.
              </p>
            </div>
          </div>
        </section>

        <section className="border border-amber-200 bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium">Recursos recomendados</h2>
          <p className="text-sm text-neutral-600">
            Materiales seleccionados por la comunidad para personas con perfiles
            similares al tuyo.
          </p>
        </section>
      </div>
    </main>
  );
}
