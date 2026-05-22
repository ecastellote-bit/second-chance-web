import Link from "next/link";
import { FULL_FLOW_COPY_V2 } from "@/lib/content/fullFlowCopyV2";

export default function FullFlowV2IntroPage() {
  const copy = FULL_FLOW_COPY_V2.intro;

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            {copy.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold">{copy.title}</h1>
          <p className="text-base text-neutral-700 leading-7">
            {copy.description}
          </p>
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Prueba paralela: el cuestionario original sigue en{" "}
            <Link href="/full" className="underline">
              /full
            </Link>
            .
          </p>
        </div>

        <div className="border border-neutral-200 rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-medium">Qué vas a hacer acá</h2>
          <ul className="space-y-2 text-sm text-neutral-700">
            {copy.bullets.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="/full-v2/step-1"
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            {copy.primaryCta}
          </Link>

          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm text-neutral-700"
          >
            {copy.secondaryCta}
          </Link>
        </div>
      </div>
    </main>
  );
}
