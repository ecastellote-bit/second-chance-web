export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
  
  export function normalizeConfidence(value: number): number {
    return clamp(Number(value.toFixed(2)), 0, 1);
  }