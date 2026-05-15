"use client";

import Link from "next/link";

export default function ProximoMovimientoPage() {
  return (
    <main className="min-h-screen bg-blue-50 text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <Link
            href="/community"
            className="text-sm text-neutral-500 underline"
          >
            Volver a las puertas
          </Link>
          <h1 className="text-3xl font-semibold">Próximo movimiento</h1>
          <p className="text-base text-neutral-700 leading-7">
            Proyectos activos, colaboraciones abiertas y oportunidades donde tu
            perfil puede aportar.
          </p>
        </div>

        <section className="border border-blue-200 bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium">Proyectos buscando colaboradores</h2>
          <p className="text-sm text-neutral-600">
            Próximamente: proyectos activos de la comunidad que necesitan
            personas con tu perfil.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">Sumarte a un equipo</p>
              <p className="text-xs text-neutral-600">
                Proyectos que buscan talento específico y donde tu perfil
                encaja.
              </p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">Lanzar tu idea</p>
              <p className="text-xs text-neutral-600">
                Publicá tu proyecto y encontrá aliados dentro de la comunidad.
              </p>
            </div>
          </div>
        </section>

        <section className="border border-blue-200 bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium">Oportunidades activas</h2>
          <p className="text-sm text-neutral-600">
            Convocatorias, becas y espacios de aceleración curados para perfiles
            como el tuyo.
          </p>
        </section>
      </div>
    </main>
  );
}
