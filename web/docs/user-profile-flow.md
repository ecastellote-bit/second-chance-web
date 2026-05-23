# Perfil de usuario en VocationUp

## Regla de producto

Sin **perfil completo** en VocationUp, la persona **no puede**:

- Sembrar o gestionar proyectos en el barrio
- Entrar a círculos, plaza, activación, eventos, formación ni puertas de comunidad
- Interactuar con otras personas como par en el neighborhood

El perfil **no sustituye** al depósito humano del diagnóstico: son dos capas.

| Capa | Qué guarda | Cuándo |
|------|------------|--------|
| **Human Depot** | Cuestionario + sentencia del diagnóstico | `/full/result` |
| **Perfil de usuario** | Identidad en el barrio (nombre, momento, buscando, aportar) | `/perfil/crear` |

## Campos obligatorios del perfil

- Nombre (cómo querés que te llamen)
- Headline (una línea de tu camino)
- Momento actual (texto libre, mín. 20 caracteres)
- Estoy buscando (≥ 1 etiqueta, separadas por comas)
- Puedo aportar (≥ 1 etiqueta)

Opcional: país. Se enlaza `diagnosticArchiveId` si ya completó el diagnóstico fundador.

## Rutas

| Ruta | Uso |
|------|-----|
| `/perfil` | Ver perfil (redirige a crear si no existe) |
| `/perfil/crear` | Alta obligatoria · `?redirect=/plaza` etc. |
| `/perfil/editar` | Actualizar datos |

## Persistencia (MVP)

- Cliente: `localStorage` → `vu_user_id`, cache de perfil completo
- Servidor local: `data/user-profiles.jsonl` + `public/uploads/`
- **Vercel (producción):** Vercel Blob (`BLOB_READ_WRITE_TOKEN`) — fotos en `profile-media/` y perfil en `user-profiles/{userId}.json`
- Sin login/password en esta etapa (auth real = siguiente fase)

## Gate

Componente `UserProfileGate` envuelve páginas del barrio. Si no hay perfil, muestra pantalla con CTA a `/perfil/crear`.

## Orden recomendado para fundadores

1. `/fundador` → cuestionario → diagnóstico archivado  
2. `/perfil/crear`  
3. Temáticas / plaza / sembrar proyecto  
