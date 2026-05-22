# Juez Contextual de Situación — VocationUp Second Chance

**Motor:** `web/lib/engines/contextualSituationJudge.ts`  
**Reglas:** `web/lib/engines/contextualPanelRules.ts`  
**Adjudicación sentencia:** `web/lib/engines/contextualSituationAdjudication.ts`  
**Golden:** `npm run contextual:golden`

---

## Propósito

Leer la **situación vital** (compresión, sostén, colectivo, voz pública real, creatividad, cuidado uno a uno) y aportar:

1. **Pre-sentencia** — enriquecer `corePattern`, `summaryForUser`, `dominantTension` vía `applyContextualInfluenceToFinalReading` (Capa 6).
2. **Post-embudo** — `themeHints`, `activationHints`, `shouldInfluenceGuidedSelection` para temáticas guiadas.

No modifica `familyScores`.

---

## Anti-cebado

- Voz pública exige audiencia explícita (no basta “comunicar”).
- Fuerza técnica suprimida si hay sostén laboral sin oficio/craft adulto.
- Community Builder no se eleva sin colectivo explícito (acompañamiento 1:1).
- Top familias solo **elegibles** (post-descarte).

---

## Integración

```text
Panel diagnóstico → Distillador → Juez contextual → Adjudicación final
                                      ↓
                    applyContextualInfluenceToFinalReading (sentencia)
```

`finalizeReadingAfterDiagnosticReview` aplica la capa contextual en los tres caminos (keep / frontera / upgrade).

---

## Trazas

`trace.contextualDiagnosticContribution` — qué campos de la sentencia tocó el juez.
