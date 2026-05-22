# Pre-lanzamiento técnico (1)

## Panel en lab

`/lab/prelaunch` — lee `/api/prelaunch/status` y muestra checks.

## Vercel (producción)

1. **Settings → Environment Variables**
   - `OPENAI_API_KEY`
   - `BLOB_READ_WRITE_TOKEN` (Storage → conectar Blob al proyecto)
   - `NEXT_PUBLIC_FOUNDATIONAL_COHORT_BATCH` = `foundational_wave_2026_05` (opcional)

2. **No** definir `NEXT_PUBLIC_VU_FOUNDER_PREVIEW_KEY` en producción.

3. Deploy → abrir `https://<dominio>/api/human-cases/status` → `durable.configured: true`

## Smoke test (prod o local con Blob)

1. `/fundador` → cuestionario → resultado → banner verde + `archiveId`
2. `/perfil/crear` → guardar
3. `/lab/foundational-cohort` → caso listado
4. `/proyectos` → semilla fundadora visible si sembraste

## Comandos

```bash
cd web
npm run presentation:golden
npm run cohort:export
```
