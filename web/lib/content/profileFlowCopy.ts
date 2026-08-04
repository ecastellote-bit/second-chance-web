export const PROFILE_FLOW_COPY = {
  gate: {
    title: "Primero tu perfil en VocationUp",
    body: "Para crear proyectos, entrar al barrio o conectar con otras personas, necesitás un perfil con foto visible (seguridad del barrio). No es un CV: es quién sos en tu camino hoy.",
    ctaCreate: "Crear mi perfil",
    ctaSignIn: "Ya tengo perfil — retomarlo",
  },
  identityMissing: {
    title: "No te reconocemos en este dispositivo",
    body: "Tu perfil vive en el barrio ligado a un email de contacto. Si ya lo creaste (en este o otro celular), retomaló con ese email. Si es la primera vez, creá uno nuevo.",
    ctaResume: "Retomar mi perfil",
    ctaCreate: "Crear perfil nuevo",
  },
  /** Versión compacta para tarjetas de listado (Serie 4 — semilla/vivo). */
  identityMissingCompact: {
    title: "Para esta acción, necesitamos tu perfil",
    body: "Si ya lo creaste, retomaló. Si no, crealo — la lectura de esta página queda libre.",
    ctaResume: "Retomar",
    ctaCreate: "Crear",
  },
  profileIncomplete: {
    title: "Tu perfil está a medio camino",
    body: "Guardamos parte de tus datos, pero falta algo obligatorio (foto, nombre o qué buscás/aportás) para actuar con confianza en el barrio.",
    cta: "Completar lo que falta",
  },
  emailMissing: {
    title: "Falta un email de contacto",
    body: "Tu perfil ya está creado. Solo necesitamos un correo privado para avisarte si algo genera un próximo paso. No se muestra en el barrio ni abre chat directo.",
    cta: "Agregar mi email",
    fieldLabel: "Email privado",
    consent:
      "Quiero que VocationUp me avise por email cuando haya novedades relevantes",
    submit: "Guardar email y continuar",
  },
  continuar: {
    eyebrow: "Retomar",
    title: "Recuperá tu lugar en el barrio",
    subtitle:
      "Si ya creaste un perfil con email, escribilo acá. Vinculamos este dispositivo a ese perfil. Todavía no verificamos el inbox: es continuidad de sesión, no una cuenta con contraseña.",
    emailLabel: "Email que usaste en el perfil",
    submit: "Retomar y continuar",
    notFound:
      "No encontramos un perfil con ese email. Revisá la escritura o creá un perfil nuevo.",
    incomplete:
      "Encontramos un perfil incompleto con ese email. Completalo para seguir.",
    invalid: "Revisá el email: necesita un formato válido.",
    createLink: "Crear perfil nuevo",
  },
  crear: {
    eyebrow: "Antes de conectar",
    title: "Tu perfil en el barrio",
    subtitle:
      "Subí tu foto de perfil (necesaria) y contá quién sos hoy, qué buscás y qué podés aportar. Sin esto no podés sembrar proyectos ni interactuar con el barrio.",
    submitCreate: "Crear perfil y continuar",
    submitEdit: "Guardar cambios",
    resumeLink: "¿Ya tenés perfil? Retomaló con tu email",
  },
  fields: {
    avatar: "Foto de perfil (necesaria)",
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
    body: "Tu email no se muestra en el barrio ni en proyectos. Lo usamos solo para avisarte novedades si lo autorizás más adelante — y para retomar tu perfil si cambiás de dispositivo.",
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

export const COMMUNITY_GATE_COPY = {
  checking: "Verificando tu lugar en el barrio…",
  ctaBack: "Volver",
} as const;
