"use client";

import Link from "next/link";

export default function ConectarConOtrosPage() {
  return (
    <main className="min-h-screen bg-emerald-50 text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <Link
            href="/community"
            className="text-sm text-neutral-500 underline"
          >
            Volver a las puertas
          </Link>
          <h1 className="text-3xl font-semibold">Conectar con otros</h1>
          <p className="text-base text-neutral-700 leading-7">
            Círculos temáticos, encuentros y espacios para conocer personas con
            intereses parecidos.
          </p>
        </div>

        <section className="border border-emerald-200 bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium">Círculos activos</h2>
          <p className="text-sm text-neutral-600">
            Próximamente: grupos temáticos donde conectar con personas que
            comparten tu dirección vocacional.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">Círculos por temática</p>
              <p className="text-xs text-neutral-600">
                Agrupados según las temáticas del sistema. Encontrá tu espacio
                natural.
              </p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">Encuentros abiertos</p>
              <p className="text-xs text-neutral-600">
                Sesiones periódicas sin agenda fija. Vení a escuchar, compartir
                o simplemente estar.
              </p>
            </div>
          </div>
        </section>

        <section className="border border-emerald-200 bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium">La plaza</h2>
          <p className="text-sm text-neutral-600">
            El espacio general de la comunidad. Sin presión, sin agenda. Solo
            explorar y conectar cuando sientas.
          </p>
        </section>
      </div>
    </main>
  );
}
