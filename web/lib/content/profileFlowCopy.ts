export const PROFILE_FLOW_COPY = {
  gate: {
    title: "Primero tu perfil en VocationUp",
    body: "Para crear proyectos, entrar al barrio o conectar con otras personas, necesitás un perfil con foto visible (seguridad del barrio). No es un CV: es quién sos en tu camino hoy.",
    ctaCreate: "Crear mi perfil",
    ctaSignIn: "Ya tengo perfil",
  },
  crear: {
    eyebrow: "Paso obligatorio",
    title: "Tu perfil en el barrio",
    subtitle:
      "Subí tu foto de perfil (obligatoria) y contá quién sos hoy, qué buscás y qué podés aportar. Sin esto no podés sembrar proyectos ni interactuar con el neighborhood.",
    submitCreate: "Crear perfil y continuar",
    submitEdit: "Guardar cambios",
  },
  fields: {
    avatar: "Foto de perfil (obligatoria)",
    cover: "Foto de portada (opcional)",
    displayName: "Nombre o cómo querés que te llamen",
    headline: "En una línea: tu camino ahora",
    momentoActual: "Tu momento actual",
    country: "País (opcional)",
    buscando: "Estoy buscando (separá con comas)",
    aportar: "Puedo aportar (separá con comas)",
    email: "Email (privado, para reconvocatoria)",
    notificationConsent:
      "Quiero que VocationUp me avise por email cuando haya novedades relevantes de mi camino en el barrio",
  },
  emailSection: {
    title: "Contacto privado",
    body: "Tu email no se muestra en el barrio ni en proyectos. Lo usamos solo para avisarte novedades si lo autorizás más adelante.",
    noVerification:
      "Todavía no verificamos que el email sea tuyo: es un dato de contacto, no una cuenta verificada.",
    savedHint: "Ya tenemos un email guardado. Podés actualizarlo abajo.",
  },
  hints: {
    headline: "Ej: Reordenando mi camino entre oficio, familia y ganas de crear",
    momentoActual: "Sin épica: dónde estás parado y qué te mueve hoy.",
    buscando: "Ej: aliados, formación, volver a escribir",
    aportar: "Ej: escucha, organización, experiencia en talleres",
    email: "tu@email.com",
  },
} as const;
