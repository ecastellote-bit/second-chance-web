/**
 * Copia de producto: dos mundos de proyectos, un barrio.
 * Semillas = convocar / señales / revisión de equipo.
 * Vivos = equipos con roles, postulaciones y hitos.
 */

export const PROJECT_WORLDS = {
  seed: {
    shortName: "Semilla",
    listEyebrow: "Mesa del barrio · semillas",
    listTitle: "Proyectos del barrio",
    listSubtitle:
      "Convocatorias semilla del equipo y de la ola fundadora: podés leer, guardar interés y dejar señales. No son equipos armados todavía.",
    detailEyebrowPublished: "Semilla del barrio · mesa de señales",
    detailEyebrowOwn: "Tu semilla · ola fundadora",
    detailHint:
      "Leé con calma. Las señales no abren chat ni membresía automática. Si querés armar un equipo con roles abiertos, eso vive en Proyectos vivos.",
    signalHint:
      "Dejar una señal pide perfil + email de contacto en este dispositivo (o retomar el que ya creaste). No se publica tu nombre al instante.",
    contributionHint:
      "Los aportes guiados se revisan antes de mostrarse. Necesitás perfil e identidad en este dispositivo.",
    bridgeToVivosTitle: "¿Querés un equipo con roles abiertos?",
    bridgeToVivosBody:
      "Las semillas reúnen interés. Los proyectos vivos son colaboraciones con roles, postulaciones y hitos.",
    bridgeToVivosCta: "Ir a Proyectos vivos",
  },
  vivo: {
    shortName: "Vivo",
    directoryTitle: "Proyectos Vivos",
    directorySubtitle:
      "Ideas colaborativas con roles abiertos. Acá se arma el equipo de verdad: postulás, el líder acepta y avisan hitos.",
    bridgeToSeedsTitle: "Inspirate con semillas fundadoras",
    bridgeToSeedsBody:
      "Las semillas son mesas en formación y ejemplos del equipo. No tienen roles ni postulaciones — solo señales e ideas.",
    bridgeToSeedsCta: "Ver semillas del barrio",
    createNeedsProfile:
      "Para publicar un proyecto vivo necesitás un perfil completo en este dispositivo (o retomar el que ya creaste).",
    applyNeedsProfile:
      "Para postularte a un rol necesitás perfil e identidad en este dispositivo.",
  },
  listBridge: {
    vivosTitle: "¿Tenés una idea y querés armar un equipo?",
    vivosBody:
      "Lanzá un proyecto colaborativo con roles abiertos. No es lo mismo que sembrar una semilla en revisión.",
    vivosCta: "Proyectos vivos →",
    seedTitle: "Sembrar una semilla",
    seedBodyQualified: "Dejá una idea para revisión del equipo fundador.",
    seedBodyLocked: "Ser fundador para sembrar una semilla revisada por el equipo.",
    seedCta: "Sembrar →",
  },
} as const;
