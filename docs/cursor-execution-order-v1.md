# Second Chance — Cursor Execution Order v1

## Orden correcto
1. docs
2. scaffolding
3. types/contracts
4. engines lite
5. prompts por módulo
6. API orchestration modular
7. frontend flow
8. result rendering
9. re-entry
10. next-step / community placeholder

## Prohibiciones
- no meter toda la lógica en route.ts
- no resolver todo con un prompt gigante
- no priorizar una landing linda por encima de los contratos
- no cambiar arquitectura sin justificarlo

## Regla de build
Todo módulo nuevo debe poder defenderse como parte del sistema final, aunque inicialmente opere en modo lite.