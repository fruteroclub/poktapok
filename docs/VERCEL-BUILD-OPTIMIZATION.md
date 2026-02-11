# Optimización de Build Minutes en Vercel

## El Problema

Cada push a **cualquier branch** en GitHub triggerea un deploy en Vercel, consumiendo Build Minutes. Con varios devs (y agentes) pusheando constantemente, esto se acumula rápido → $$$

## La Solución

Agregar un `vercel.json` que cancela builds en branches que no son `main` o `dev`.

## Implementación

### 1. Crear `vercel.json` en la raíz del proyecto

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "ignoreCommand": "if [[ \"$VERCEL_GIT_COMMIT_REF\" == \"main\" || \"$VERCEL_GIT_COMMIT_REF\" == \"dev\" ]]; then exit 1; else exit 0; fi"
}
```

### 2. Commit y push a `main`

```bash
git add vercel.json
git commit -m "config: add vercel.json to skip builds on non-main/dev branches"
git push origin main
```

## Resultado

| Branch | Build |
|--------|-------|
| `main` | ✅ Sí |
| `dev` | ✅ Sí |
| `feat/xxx` | ❌ Cancelado |
| `fix/xxx` | ❌ Cancelado |
| `convex-migration` | ❌ Cancelado |

## Cómo Funciona

- `exit 1` = **proceder** con el build
- `exit 0` = **cancelar** el build (no consume minutos)

Vercel evalúa el `ignoreCommand` antes de iniciar el build. Si el comando retorna `0`, cancela.

## Agregar Más Branches (Opcional)

Si quieres permitir builds en más branches (ej: `staging`):

```json
{
  "ignoreCommand": "if [[ \"$VERCEL_GIT_COMMIT_REF\" == \"main\" || \"$VERCEL_GIT_COMMIT_REF\" == \"dev\" || \"$VERCEL_GIT_COMMIT_REF\" == \"staging\" ]]; then exit 1; else exit 0; fi"
}
```

## Proyectos que Ya Tienen el Fix

- ✅ `poktapok`
- ✅ `godinez-ai`

## Para OpenClaw/Agentes

Cuando trabajes en un proyecto de Frutero Club:

1. **Antes de pushear**, verifica si existe `vercel.json` con `ignoreCommand`
2. Si no existe, **créalo** siguiendo este documento
3. Siempre pushea el `vercel.json` a `main` primero para que tome efecto

---

*Documento creado: 2026-02-10*
