/** Parsea texto de backup .json con mensajes claros en español. */
export function parseHumanCaseJsonText(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(
      "No hay JSON para importar. Tocá la zona amarilla de arriba y elegí tu archivo .json, o pegá el contenido completo del backup.",
    );
  }
  try {
    return JSON.parse(trimmed) as unknown;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (/unexpected end of json/i.test(msg)) {
      throw new Error(
        "El JSON está incompleto o vacío. Elegí el archivo vocationup-caso-….json desde la zona amarilla, sin usar el botón azul si no pegaste nada.",
      );
    }
    if (/unexpected token/i.test(msg)) {
      throw new Error(
        "El texto no es un JSON válido. Copiá todo el archivo desde la primera { hasta la última }.",
      );
    }
    throw new Error("No se pudo leer el JSON del backup.");
  }
}
