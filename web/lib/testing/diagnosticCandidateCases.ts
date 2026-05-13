/**
 * Diagnostic Candidate Cases — Batch Testing Registry
 *
 * Este archivo aloja casos candidatos entregados por Vocacional para validación
 * por lote antes de ser promovidos (o no) a learnedCases.
 *
 * NO es learnedCases. NO es seedDiagnosticCases.
 * Los casos aquí NO influyen en el motor diagnóstico.
 * Son exclusivamente para validación offline y revisión humana.
 *
 * Vocacional pega aquí los casos candidatos.
 * El runner de lotes los toma, ejecuta el pipeline y compara con `expected`.
 * Ningún caso se promueve automáticamente a learnedCases.
 */

import type { DiagnosticCandidateCase } from "../types/diagnosticCandidateCases";

export const diagnosticCandidateCases: DiagnosticCandidateCase[] = [];

// ---------------------------------------------------------------------------
// Ejemplo comentado — estructura esperada de un caso candidato:
// ---------------------------------------------------------------------------
//
// {
//   id: "candidate_community_builder_dry_compression_001",
//   title: "Comunidad seca — impulso comunitario comprimido por falta de resto",
//   category: "compression_case",
//   source: "vocacional_manual",
//   language: "es",
//   region: "argentina",
//   register: "rough",
//   expected: {
//     resultType: "compressed_life",
//     primaryFamily: "community_builder",
//     acceptablePrimaryFamilies: ["community_builder"],
//     acceptableSecondaryFamilies: ["empathic_guide", "diplomatic_social_connector"],
//     rivalFamilies: ["empathic_guide"],
//     shouldNotWin: ["empathic_guide", "creative_storyteller"],
//     coreAffinities: ["social_coordination", "group_reading", "trust_building"],
//     buriedAffinities: ["social_coordination"],
//     expectedCompression: true,
//     expectedFrontier: false,
//     expectedFollowUp: false,
//   },
//   userInput: {
//     currentSituation:
//       "Laburo de administrativo, estable pero no me representa. Lo que siempre me salió fue juntar gente, armar grupos, sostener movidas. Pero estoy bastante seco.",
//     repeatedPatterns:
//       "Siempre terminé armando grupos, convocando, sosteniendo el hilo de proyectos grupales. Si no muevo yo, se enfrían.",
//     compressedLife:
//       "No me queda resto para sostener comunidad como antes. El impulso comunitario está ahogado por cansancio y falta de margen.",
//     restrictions:
//       "No puedo resignar ingresos ni horarios por ahora. Poco margen para movidas nuevas.",
//     assets:
//       "Armar redes, convocar, cuidar clima grupal, hacer que la gente vuelva.",
//     childhoodMemories:
//       "De chico armaba clubes, bandas de amigos, torneos internos, grupos de lo que fuera.",
//     earlyFascinations:
//       "Me fascinaba juntar gente distinta y que funcionara. Que nadie quedara colgado.",
//     meaningfulSubjects:
//       "Nada del colegio me marcó tanto como lo que armaba afuera: grupos, participación, proyectos con otros.",
//     naturalSocialRoles:
//       "El que arma, el que convoca, el que sostiene el hilo cuando todos se dispersan.",
//     additionalNote:
//       "No busco terapia ni acompañamiento individual. Lo mío es la comunidad, pero hoy no me da el cuerpo.",
//   },
//   validation: {
//     passCriteria: [
//       "community_builder aparece como primera familia",
//       "resultType es compressed_life",
//       "empathic_guide no desplaza a community_builder",
//       "hay señal de compresión comunitaria",
//     ],
//     reviewCriteria: [
//       "si empathic_guide queda muy cerca (gap < 0.08), marcar como frontera",
//       "si resultType es clear_direction en vez de compressed_life, revisar detección de strain",
//     ],
//     failCriteria: [
//       "empathic_guide gana como primera familia",
//       "resultType es insufficient_evidence",
//       "community_builder no aparece en top 3",
//     ],
//     recommendedInitialUse: "candidate_learned_case",
//     notes:
//       "Caso diseñado para validar que la compresión comunitaria se detecta correctamente sin ceder el top a EG por vocabulario genérico de ayuda.",
//   },
//   qualityFlags: {
//     containsTechnicalLabels: false,
//     feelsArtificial: false,
//     tooKeywordStuffed: false,
//     needsHumanReview: false,
//   },
// }
