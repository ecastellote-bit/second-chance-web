export const PROFILE_FLOW_COPY = {
  gate: {
    title: "Primero tu perfil en VocationUp",
    body: "Para crear proyectos, sumarte al barrio o interactuar con otras personas, necesitás un perfil. No es un CV: es quién sos en tu camino ahora.",
    ctaCreate: "Crear mi perfil",
    ctaSignIn: "Ya tengo perfil",
  },
  crear: {
    eyebrow: "Paso obligatorio",
    title: "Tu perfil en el barrio",
    subtitle:
      "Contá quién sos hoy, qué buscás y qué podés aportar. Sin esto no podés sembrar proyectos ni interactuar con el neighborhood.",
    submitCreate: "Crear perfil y continuar",
    submitEdit: "Guardar cambios",
  },
  fields: {
    displayName: "Nombre o cómo querés que te llamen",
    headline: "En una línea: tu camino ahora",
    momentoActual: "Tu momento actual",
    country: "País (opcional)",
    buscando: "Estoy buscando (separá con comas)",
    aportar: "Puedo aportar (separá con comas)",
  },
  hints: {
    headline: "Ej: Reordenando mi camino entre oficio, familia y ganas de crear",
    momentoActual: "Sin épica: dónde estás parado y qué te mueve hoy.",
    buscando: "Ej: aliados, formación, volver a escribir",
    aportar: "Ej: escucha, organización, experiencia en talleres",
  },
} as const;
