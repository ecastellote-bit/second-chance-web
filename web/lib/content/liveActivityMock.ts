/** Copy atmosférico — sin afirmar veracidad en tiempo real. */
export const LIVE_ACTIVITY_COPY = {
  badge: "EN MOVIMIENTO",
  full: {
    title: "Actividad fundadora",
    subtitle: "Nuevas personas se están sumando a VocationUp…",
    actionLabel: "Se unió",
    footer: "Así empieza a moverse el barrio",
    scanLabel: "Actividad de incorporación",
  },
  compact: {
    title: "Pantalla viva del barrio",
    subtitle: "Nuevas personas se están sumando…",
    actionLabel: "Se unió",
    footer: "En movimiento",
    scanLabel: "Actualizando",
  },
} as const;

export type LiveActivityRow = {
  id: string;
  initials: string;
  when: string;
  location: string;
};

export const LIVE_ACTIVITY_INITIALS: readonly string[] = [
  "E. C.",
  "R. B.",
  "M. G.",
  "P. G.",
  "L. A.",
  "N. T.",
  "C. R.",
  "S. V.",
  "J. M.",
  "A. D.",
  "F. P.",
  "I. L.",
  "T. S.",
  "V. H.",
  "G. O.",
  "D. N.",
  "K. R.",
  "H. M.",
  "B. S.",
  "O. F.",
  "U. P.",
  "W. L.",
  "Y. C.",
  "Z. A.",
  "Q. D.",
  "X. B.",
  "A. R.",
  "C. M.",
  "E. V.",
  "G. L.",
  "I. N.",
  "J. P.",
  "L. S.",
  "M. T.",
  "N. H.",
  "P. A.",
  "R. G.",
  "S. C.",
  "T. M.",
  "V. R.",
  "A. G.",
  "B. L.",
  "C. F.",
  "D. S.",
  "F. M.",
  "H. C.",
  "K. A.",
  "L. P.",
  "M. B.",
  "N. G.",
];

export const LIVE_ACTIVITY_MINUTES: readonly string[] = [
  "hace 1 minuto",
  "hace 2 minutos",
  "hace 3 minutos",
  "hace 4 minutos",
  "hace 5 minutos",
  "hace 6 minutos",
  "hace 7 minutos",
  "hace 8 minutos",
  "hace 9 minutos",
  "hace 11 minutos",
  "hace 12 minutos",
  "hace 14 minutos",
  "hace 15 minutos",
  "hace 17 minutos",
  "hace 19 minutos",
  "hace 22 minutos",
  "hace 24 minutos",
  "hace 27 minutos",
  "hace 31 minutos",
  "hace 34 minutos",
  "hace 38 minutos",
  "hace 41 minutos",
  "hace 45 minutos",
  "hace 52 minutos",
  "hace 58 minutos",
  "hace 1 hora",
  "hace 1 h",
  "hace poco",
  "recién",
  "hace unos minutos",
];

export const LIVE_ACTIVITY_LOCATIONS: readonly string[] = [
  "cerca de Rosario",
  "Concordia",
  "Monzón",
  "Misiones",
  "San Miguel de Tucumán",
  "Córdoba",
  "La Plata",
  "Santa Fe",
  "Villa Crespo",
  "Salta",
  "Mendoza",
  "Mar del Plata",
  "cerca de CABA",
  "zona norte",
  "zona oeste",
  "Resistencia",
  "Neuquén",
  "Paraná",
  "Bahía Blanca",
  "Posadas",
  "San Juan",
  "Formosa",
  "Corrientes",
  "Trelew",
  "Comodoro Rivadavia",
  "Rafaela",
  "Reconquista",
  "San Nicolás",
  "Pergamino",
  "Junín",
  "Tandil",
  "Necochea",
  "Olivos",
  "Morón",
  "Quilmes",
  "Lanús",
  "Lomas de Zamora",
  "San Isidro",
  "Tigre",
  "Pilar",
  "zona sur",
  "Gran Buenos Aires",
  "Litoral argentino",
  "NOA",
  "Cuyo",
  "Patagonia",
  "Entre Ríos",
  "Chaco",
  "Santiago del Estero",
  "La Rioja",
];

const RECENT_COMBO_LIMIT = 32;

function comboKey(row: Pick<LiveActivityRow, "initials" | "when" | "location">): string {
  return `${row.initials}|${row.when}|${row.location}`;
}

function pickRandom<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function buildRandomRow(id: string): LiveActivityRow {
  return {
    id,
    initials: pickRandom(LIVE_ACTIVITY_INITIALS),
    when: pickRandom(LIVE_ACTIVITY_MINUTES),
    location: pickRandom(LIVE_ACTIVITY_LOCATIONS),
  };
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Genera un lote grande de filas únicas para rotación sin repetición frecuente. */
function buildUniqueBatch(size: number, exclude: Set<string>): LiveActivityRow[] {
  const rows: LiveActivityRow[] = [];
  const seen = new Set(exclude);
  let attempts = 0;
  const maxAttempts = size * 40;

  while (rows.length < size && attempts < maxAttempts) {
    attempts += 1;
    const candidate = buildRandomRow(`row_${Date.now()}_${attempts}`);
    const key = comboKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(candidate);
  }

  return shuffleInPlace(rows);
}

export type LiveActivityFeed = {
  take: (count: number) => LiveActivityRow[];
  next: () => LiveActivityRow;
};

export function createLiveActivityFeed(): LiveActivityFeed {
  let queue: LiveActivityRow[] = [];
  const recentCombos: string[] = [];

  function remember(row: LiveActivityRow) {
    recentCombos.push(comboKey(row));
    while (recentCombos.length > RECENT_COMBO_LIMIT) {
      recentCombos.shift();
    }
  }

  function refill() {
    const exclude = new Set(recentCombos);
    queue = buildUniqueBatch(120, exclude);
  }

  function next(): LiveActivityRow {
    if (queue.length === 0) refill();
    const row = queue.pop()!;
    remember(row);
    return { ...row, id: `${row.id}_${Date.now()}` };
  }

  return {
    take(count: number) {
      return Array.from({ length: count }, () => next());
    },
    next,
  };
}

/** Intervalo de rotación entre 2.5 y 4 s. */
export function nextLiveActivityTickMs(): number {
  return 2500 + Math.floor(Math.random() * 1501);
}
