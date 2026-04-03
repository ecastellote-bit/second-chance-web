export function safeLower(value?: string | null): string {
    return (value ?? "").trim().toLowerCase();
  }
  
  export function includesAny(text: string, terms: string[]): boolean {
    const normalized = safeLower(text);
    return terms.some((term) => normalized.includes(safeLower(term)));
  }
  
  export function compactStrings(values: Array<string | undefined | null>): string[] {
    return values.map((v) => (v ?? "").trim()).filter(Boolean);
  }
  
  export function uniqueStrings(values: string[]): string[] {
    return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
  }