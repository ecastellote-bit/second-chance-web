# Golden set — Juez de Coherencia Narrativa

Usar esta tabla al correr casos en `/lab`. Marcar cada columna después de `POST /api/lab-analyze`.

**Leyenda ideales:** A=historia · B=mismatch/aligned · C=compresión · D=summary+tensión · E=no tocó scores · F=visible

**Palancas (Fase 2, simular):** P1=compresión · P2=mismatch · P3=copy frontera · **Nudge**=¿activaría Fase 3? (no ejecutar en prueba)

---

## Casos obligatorios (gate A+B+C)

| ID | Fuente | Expectativa narrativa | Veredicto esperado | Ideal | P1 | P2 | P3 | Nudge (F3) |
|----|--------|----------------------|-------------------|-------|----|----|-----|------------|
| `estefi_pioneer` | `data/learning/imports/estefi-2026-05-17.json` | Empathic + investigación + diplomacia postergada; admin = sostén; vida comprimida | `narrative_mismatch` vs Artistic/Technical + `compressed_life_undetected` | A,B,C,D | sí | sí | sí | sí (empathic vs artistic top) |
| `voc_human_01_voz_publica_encerrada` | humanLanguageCases | Public Communicator; postura/audiencia/intervención | `narrative_mismatch` si top Creative | A,B | — | sí | sí | sí |
| `voc_human_02_narrador_sin_puerta` | humanLanguageCases | Creative Storyteller; forma sin audiencia | `narrative_mismatch` si top Public | A,B | opcional | sí | sí | sí |
| `voc_human_03_guia_empatico_sin_cauce` | humanLanguageCases | Empathic Guide uno a uno; no community/diplomatic | `narrative_mismatch` si top grupal | A,B | — | sí | opcional | opcional |
| `fail_ref_creative_storyteller_compressed` | learnedCases (texto) | Creative + compressed; no Public por escribir | `narrative_mismatch` + C | A,B,C | sí | sí | sí | — |
| `fail_ref_system_designer_parches` | learnedCases (texto) | system_designer; no technical_builder | `narrative_mismatch` | A,B | — | sí | opcional | sí |
| `fail_ref_operational_organizer_burnout` | learnedCases (texto) | operational + compressed; no clear | C + mismatch o frontier | A,C | sí | opcional | sí | — |
| `fail_ref_empathic_guide_overload` | learnedCases (texto) | empathic + compressed por sobreuso | C; no clear | A,C | sí | opcional | sí | — |

> **estefi_pioneer:** importar payload desde `estefi-2026-05-17.json` o pegar narrative manual en lab si el caso no está en el selector.

---

## Casos alineados (especificidad ≥80%)

| ID | Veredicto esperado | Ideal | P2 debe ser NO |
|----|-------------------|-------|----------------|
| `voc_t12_conector_claro` | `aligned` | A,B,D,E | sí |
| `voc_t1_escucha_uno_a_uno` | `aligned` (empathic) | A,B,D | sí |
| `voc_t9_publico_con_postura` | `aligned` o `frontier` (public) | A,D | sí |

---

## Grupos de riesgo (muestreo lab)

| Grupo | IDs ejemplo | Qué validar |
|-------|-------------|-------------|
| Public vs Creative | voc_t22, t30, t36, t18, t23 | B, lexical_trap |
| Empathic vs grupal | voc_t19, t27, t28 | B |
| System vs Technical | diagnostic candidate parches | B, Nudge |
| Compresión | voc_t11, t13, t17 | C, P1 |

---

## Checklist por corrida

- [ ] `narrativeSummary` es historia, no keywords (A)
- [ ] `coreTension` tiene abandonó / hace / anhela (A)
- [ ] `evidence` ≥ 2 citas literales del payload (B)
- [ ] `family` sugerida ∈ registro de 22 familias (E)
- [ ] `familyScores` del pipeline **idénticos** antes/después (E — Fase 1)
- [ ] Bloque “Coherencia narrativa” visible en lab (F)

---

## Registro de corridas (plantilla)

| Fecha | ID caso | verdict | confidence | family sugerida | top motor | ¿A? | ¿B? | ¿C? | P1 | P2 | Nudge | Notas |
|-------|---------|---------|------------|---------------|-----------|-----|-----|-----|----|----|-------|-------|
| | | | | | | | | | | | | |

---

## Criterio de paso a Fase 2

- Golden obligatorios (8 filas): **≥7/8** cumplen veredicto + flags esperados.
- Casos alineados (3): **≥2/3** sin P2.
- Equipo revisa Estefi + human_01/02 en reunión única.
