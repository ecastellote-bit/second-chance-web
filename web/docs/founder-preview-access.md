# Acceso temporal — explorar Comunidad (solo fundador)

**No subir la clave a GitHub.** Usar solo en `web/.env.local` (gitignored).

## 1. Crear `web/.env.local`

```env
# Clave privada: elegí una frase larga solo vos la conocés
NEXT_PUBLIC_VU_FOUNDER_PREVIEW_KEY=tu-frase-secreta-aqui

# Opcional — mismo batch que pioneros
NEXT_PUBLIC_FOUNDATIONAL_COHORT_BATCH=foundational_wave_2026_05
```

Reiniciá `npm run dev` después de guardar.

## 2. Activar modo exploración

En el navegador (una vez por sesión):

```
http://localhost:3000/fundador?preview-comunidad=tu-frase-secreta-aqui
```

Si la clave coincide, podés entrar a **plaza, círculos, proyectos, barrio**, etc. **sin** cuestionario ni perfil.

Aparece un banner ámbar: *Modo exploración fundador*.

## 3. Salir del modo

Clic en **Salir del modo** en el banner, o borrá en consola del navegador:

```js
sessionStorage.removeItem('vu_founder_community_preview')
```

## 4. Producción

**No** definir `NEXT_PUBLIC_VU_FOUNDER_PREVIEW_KEY` en Vercel salvo emergencia breve. Los invitados nunca deben tener esta variable.
