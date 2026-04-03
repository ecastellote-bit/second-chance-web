import Link from "next/link";

export default function FullFlowIntroPage() {
  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Second Chance — Full Flow v1
          </p>
          <h1 className="text-3xl font-semibold">
            Lectura inicial seria, sin promesas vacías
          </h1>
          <p className="text-base text-neutral-700 leading-7">
            Este flujo no intenta adivinar una vocación mágica. Intenta leer tu
            historia, tu contexto actual y tus restricciones para detectar qué
            movimientos laborales tienen más sentido ahora.
          </p>
        </div>

        <div className="border border-neutral-200 rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-medium">Qué vas a hacer acá</h2>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>• ordenar tu contexto actual</li>
            <li>• recuperar señales de historia personal</li>
            <li>• distinguir entre cansancio, refugio y dirección</li>
            <li>• recibir una lectura inicial estructurada</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="/full/step-1"
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            Empezar
          </Link>

          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm text-neutral-700"
          >
            Volver
          </Link>
        </div>
      </div>
    </main>
  );
}