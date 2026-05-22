# Capa Semántica — VocationUp Second Chance

**Extracción:** `semanticExtractor.ts` (LLM) → **Calibrador:** `semanticExtractionCalibrator.ts`  
**Similitud:** `semanticSimilarityEngine.ts` (embeddings)  
**Mezcla afinidades:** `affinityPipelineBridge.ts`  
**Golden:** `npm run semantic:golden`

---

## Principio (Carta Magna)

**LLM/embeddings recomiendan; TypeScript valida y atenúa** antes de tocar `familyScores` o `learningSignal`.

---

## Extracción (afinidades + narrativeFlags)

1. `gpt-4o-mini` devuelve señales y flags.
2. `calibrateSemanticExtraction` corrige inflaciones universales:
   - Sin audiencia explícita → cap `public_expression` / flags públicos.
   - Sostén admin sin oficio técnico → cap ejecución/práctica.
   - 1:1 sin colectivo → cap coordinación grupal.
3. `affinityPipelineBridge` mezcla con pesos dinámicos (más conservadores que antes).

---

## Similitud vectorial (casos aprendidos)

| Similitud | Tier | Peso en learning |
|-----------|------|------------------|
| ≥ 0.52 | influential | 1.0 |
| 0.40–0.51 | note | 0.35 |
| &lt; 0.40 | excluded | no merge |

- Búsqueda API: min **0.48** (antes 0.45).
- `prepareSemanticMatchesForLearning` antes de fusionar con tokens.
- `similarityScore` efectivo = `similarity × influenceWeight`.

---

## Qué NO hace

- No reemplaza motores CVME/TDM ni jueces.
- No escribe sentencia al usuario (eso es contextual + adjudicación).
