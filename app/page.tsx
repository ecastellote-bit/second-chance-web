import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl leading-tight font-semibold text-slate-900 sm:text-4xl">
          Muchos llegan hasta acá porque sienten que eligieron mal, se desviaron o todavía no
          encontraron su lugar.
        </h1>

        <p className="mt-5 text-lg text-slate-700 sm:text-xl">
          Si este es tu caso, estás en el lugar correcto.
        </p>

        <p className="mt-6 text-base text-slate-600 sm:text-lg">
          Esto no es un test rápido. Si podés, tomate unos minutos y hacelo con calma.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/full"
            className="w-full rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 sm:w-auto"
          >
            Quiero hacerlo bien
          </Link>

          <Link
            href="/quick"
            className="w-full rounded-lg border border-slate-300 bg-transparent px-6 py-3 text-base font-semibold text-slate-900 transition-colors duration-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 sm:w-auto"
          >
            Prefiero algo rápido
          </Link>
        </div>
      </div>
    </main>
  );
}

