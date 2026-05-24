"use client";

import Link from "next/link";

export type DeliverableNavigation = {
  themesHref: string;
  plazaHref: string;
};

type CitaFundamentada = {
  texto?: string;
  fuente?: "narrativo" | "intake";
  momento?: string;
  fundamento?: string;
};

type AlertaLectura = {
  titulo?: string;
  cuerpo?: string;
  severidad?: "alta" | "media" | "baja";
};

type LecturaCentral = {
  sentenciaRevelacion?: string;
  resumen?: string;
  tensionViva?: string;
  porQue?: string;
};

type Referencia = {
  familyId?: string;
  referenceTitle?: string;
  referenceBody?: string;
  resonance?: "alta" | "media" | "exploratoria";
  puenteNarrativo?: string;
  evidenciasVinculadas?: CitaFundamentada[];
};

export type PresentationForView = {
  lecturaCentral?: LecturaCentral;
  enTusPalabras?: CitaFundamentada[];
  alertasLectura?: AlertaLectura[];
  momentoVital?: string;
  referenciasQueResuenan?: Referencia[];
  comoArmamosTuLectura?: string;
  loQueNoCerramos?: string;
  siguientePaso?: {
    invitation?: string;
    themeTeaser?: string[];
    activacionSugerida?: {
      label?: string;
      plazaWelcomeLine?: string;
    };
  };
};

const RESONANCE_LABEL: Record<string, string> = {
  alta: "muy presente",
  media: "presente",
  exploratoria: "en exploración",
};

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function SectionLabel({
  step,
  title,
  fundamento,
}: {
  step: string;
  title: string;
  fundamento: string;
}) {
  return (
    <div className="space-y-1 border-b border-neutral-200 pb-4 mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
        {step}
      </p>
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>
      <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl">{fundamento}</p>
    </div>
  );
}

export function PersonalizedDiagnosticDeliverable({
  presentation,
  navigation,
}: {
  presentation: PresentationForView;
  navigation?: DeliverableNavigation;
}) {
  const lc = presentation.lecturaCentral;
  if (!lc?.sentenciaRevelacion && !lc?.resumen) return null;

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20">
      {/* HERO — sentencia */}
      <section className="rounded-2xl bg-neutral-950 text-white px-5 py-10 sm:px-8 md:px-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400 mb-4 sm:mb-6">
          Lo que tu historia pide decir
        </p>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug tracking-tight text-balance">
          {lc.sentenciaRevelacion}
        </p>
        <p className="mt-8 text-sm text-neutral-400 max-w-2xl leading-relaxed">
          Fundamentado en tu relato, en lo que contaste de tu momento y en las
          señales que aparecen con claridad. No es una etiqueta: es una lectura
          que se apoya en lo que ya trajiste.
        </p>
      </section>

      {/* 1 — Resumen */}
      {lc.resumen && (
        <section>
          <SectionLabel
            step="01 · Lectura central"
            title="Quién aparece en tu historia"
            fundamento="Síntesis de coherencia sobre tu relato completo."
          />
          <p className="text-lg md:text-xl text-neutral-800 leading-relaxed max-w-4xl">
            {lc.resumen}
          </p>
        </section>
      )}

      {/* 2 — Tensión */}
      {lc.tensionViva && (
        <section className="rounded-2xl border-2 border-neutral-900 px-8 py-10 md:px-10">
          <SectionLabel
            step="02 · Tensión viva"
            title="Lo que está en juego"
            fundamento="Lo que se enfrenta en vos hoy, en tus propias palabras."
          />
          <p className="text-xl md:text-2xl font-medium text-neutral-900 leading-relaxed">
            {lc.tensionViva}
          </p>
        </section>
      )}

      {/* 3 — Por qué */}
      {lc.porQue && (
        <section>
          <SectionLabel
            step="03 · Por qué esta lectura"
            title="El argumento que sostiene la sentencia"
            fundamento="Por qué esta lectura encaja con tu historia y no con un cierre automático."
          />
          <p className="text-base md:text-lg text-neutral-800 leading-relaxed max-w-4xl whitespace-pre-wrap">
            {lc.porQue}
          </p>
        </section>
      )}

      {/* 4 — En tus palabras */}
      {safeArray(presentation.enTusPalabras).length > 0 && (
        <section>
          <SectionLabel
            step="04 · En tus palabras"
            title="Evidencia que no inventamos"
            fundamento="Fragmentos de tu relato que sostienen esta lectura; cada uno con su fundamento."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {safeArray(presentation.enTusPalabras).map((cita, index) => (
              <article
                key={`cita-${index}`}
                className="rounded-xl border border-neutral-200 bg-white p-6 md:p-8 space-y-4 shadow-sm"
              >
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-neutral-500">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                    {cita.fuente === "narrativo" ? "Lectura narrativa" : "Tu relato"}
                  </span>
                  {cita.momento && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                      {cita.momento}
                    </span>
                  )}
                </div>
                <blockquote className="text-base md:text-lg text-neutral-900 leading-relaxed italic border-l-4 border-neutral-900 pl-5">
                  «{cita.texto}»
                </blockquote>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  <span className="font-medium text-neutral-800">Fundamento: </span>
                  {cita.fundamento}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Alertas */}
      {safeArray(presentation.alertasLectura).length > 0 && (
        <section>
          <SectionLabel
            step="05 · Alertas de lectura"
            title="Qué no conviene ignorar"
            fundamento="Señales del momento vital: honestidad antes que cierre."
          />
          <div className="space-y-4">
            {safeArray(presentation.alertasLectura).map((alerta, index) => (
              <div
                key={`alerta-${index}`}
                className={`rounded-xl p-6 md:p-8 border ${
                  alerta.severidad === "alta"
                    ? "border-amber-300 bg-amber-50"
                    : "border-neutral-200 bg-neutral-50"
                }`}
              >
                <p className="font-semibold text-neutral-900">{alerta.titulo}</p>
                <p className="mt-2 text-sm md:text-base text-neutral-700 leading-relaxed">
                  {alerta.cuerpo}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Momento vital */}
      {presentation.momentoVital && (
        <section>
          <SectionLabel
            step="06 · Momento vital"
            title="Dónde estás parada hoy"
            fundamento="Fuerzas del presente que condicionan cómo se despliega lo anterior."
          />
          <p className="text-base md:text-lg text-neutral-800 leading-relaxed max-w-4xl">
            {presentation.momentoVital}
          </p>
        </section>
      )}

      {/* Referencias */}
      {safeArray(presentation.referenciasQueResuenan).length > 0 && (
        <section>
          <SectionLabel
            step="07 · Referencias"
            title="Modos de aporte que resuenan"
            fundamento="Referencias en español (sin etiquetas en inglés), subordinadas a la lectura central."
          />
          <div className="space-y-6">
            {safeArray(presentation.referenciasQueResuenan).map((ref, index) => (
              <article
                key={`ref-${ref.familyId ?? index}`}
                className="rounded-xl border border-neutral-200 p-6 md:p-8 space-y-3"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {ref.referenceTitle}
                  </h3>
                  {ref.resonance && (
                    <span className="text-xs uppercase tracking-wide text-neutral-500">
                      {RESONANCE_LABEL[ref.resonance] ?? ref.resonance}
                    </span>
                  )}
                </div>
                {ref.puenteNarrativo && (
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {ref.puenteNarrativo}
                  </p>
                )}
                <p className="text-sm md:text-base text-neutral-800 leading-relaxed">
                  {ref.referenceBody}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Cómo armamos */}
      {presentation.comoArmamosTuLectura && (
        <section className="rounded-xl bg-neutral-50 border border-neutral-200 px-8 py-8">
          <SectionLabel
            step="08 · Transparencia"
            title="Cómo armamos tu lectura"
            fundamento="Cadena de capas que intervinieron; sin lista técnica suelta."
          />
          <p className="text-sm md:text-base text-neutral-700 leading-relaxed max-w-4xl">
            {presentation.comoArmamosTuLectura}
          </p>
        </section>
      )}

      {/* Lo que no cerramos */}
      {presentation.loQueNoCerramos && (
        <section>
          <SectionLabel
            step="09 · Frontera"
            title="Lo que no cerramos"
            fundamento="Frontera abierta, compresión o revisión humana si aplica."
          />
          <p className="text-base md:text-lg text-neutral-800 leading-relaxed max-w-4xl">
            {presentation.loQueNoCerramos}
          </p>
        </section>
      )}

      {/* Siguiente paso */}
      {presentation.siguientePaso && (
        <section className="rounded-2xl border-2 border-black px-8 py-10 md:px-12 text-center space-y-6">
          <SectionLabel
            step="10 · Siguiente paso"
            title="Tu lectura no termina acá"
            fundamento="Puente hacia temáticas, activación y plaza — consecuencia de lo revelado."
          />
          <p className="text-base md:text-lg text-neutral-800 leading-relaxed max-w-3xl mx-auto">
            {presentation.siguientePaso.invitation}
          </p>
          {safeArray(presentation.siguientePaso.themeTeaser).length > 0 && (
            <ul className="flex flex-wrap justify-center gap-3">
              {safeArray(presentation.siguientePaso?.themeTeaser).map((theme, i) => (
                <li key={`theme-${i}`}>
                  {navigation?.themesHref ? (
                    <Link
                      href={navigation.themesHref}
                      className="inline-block rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-800 hover:border-black hover:bg-neutral-50 transition-colors"
                    >
                      {theme}
                    </Link>
                  ) : (
                    <span className="inline-block rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-800">
                      {theme}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {presentation.siguientePaso.activacionSugerida?.label && (
            <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
              Puerta sugerida al barrio:{" "}
              <strong>{presentation.siguientePaso.activacionSugerida.label}</strong>
              {presentation.siguientePaso.activacionSugerida.plazaWelcomeLine && (
                <> — {presentation.siguientePaso.activacionSugerida.plazaWelcomeLine}</>
              )}
            </p>
          )}
          {navigation && (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
              <Link
                href={navigation.themesHref}
                className="rounded-xl bg-black px-8 py-3 text-sm font-medium text-white"
              >
                Elegir temática
              </Link>
              <Link
                href={navigation.plazaHref}
                className="rounded-xl border border-black/20 px-8 py-3 text-sm font-medium text-neutral-900"
              >
                Ir al barrio
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
