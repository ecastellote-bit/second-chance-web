# Golden set — Juez de Descarte

```bash
npm run discard:golden
```

## Criterio anti-cebado

Una regla **no es válida** si mejora un solo caso pero rompe `human_01`, `human_02` o `human_03`. El golden exige:

| Caso | Debe permanecer elegible | Debe excluirse si compite (top 8) |
|------|--------------------------|-----------------------------------|
| Estefi | empathic_guide, cultural_explorer, educator_interpreter | system_designer, technical_builder, operational_organizer, scientific_investigator (si compiten top 8) |
| human_01 | public_communicator | creative_storyteller |
| human_02 | creative_storyteller, artistic_creator | — |
| human_03 | empathic_guide | community_builder |
| fail_ref_* | `acceptableFamilies` del brief | `rivalFamilies` del brief |

Estefi **no** tiene reglas con su nombre ni keywords únicas: usa arcos universales (sostén admin, compresión vital, investigación/escucha).

Reportes en `data/reports/discard-golden-*.json`.
