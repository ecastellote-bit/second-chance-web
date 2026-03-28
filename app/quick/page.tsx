import Link from "next/link";

export default function QuickPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl leading-tight font-semibold text-slate-900 sm:text-4xl">
          Versión rápida
        </h1>

        <p className="mt-5 text-base text-slate-600 sm:text-lg">
          Placeholder: este espacio mostrará la versión rápida del proceso cuando esté lista.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

