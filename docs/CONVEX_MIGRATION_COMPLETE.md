# Migración Completa a Convex

**Fecha:** 2025-02-07
**Branch:** `convex-migration`
**Estado:** ✅ Completada

## Resumen

La migración de Drizzle/Neon a Convex está completa. El proyecto ahora usa exclusivamente Convex para todas las operaciones de base de datos.

## Cambios Principales

### Nuevas Funciones Convex

| Archivo | Funciones |
|---------|-----------|
| `convex/activities.ts` | listPublic, listAll, getById, create, update, remove |
| `convex/applications.ts` | submit, getByUser, list, listPending, approve, reject |
| `convex/auth.ts` | getOrCreateUser, updateUser, getUserByPrivyDid, deleteUser |
| `convex/events.ts` | list, listPublished, listUpcoming, listFeatured, getByLumaSlug, upsert |
| `convex/profiles.ts` | listPublic, upsert, getByUserId, getByUsername, update |
| `convex/programs.ts` | listActive, getById, getDashboard, create, update, remove |
| `convex/projects.ts` | getById, getByUser, getMyProjects, listPublic, create, update, remove |
| `convex/sessions.ts` | listPublic, listAll, getByProgram, getById, create, update, remove |
| `convex/users.ts` | getByPrivyDid, getByUsername, list, etc. |

### Hooks Actualizados

Todos los hooks ahora usan `useQuery` y `useMutation` de Convex:

- `use-activities.ts` - Activities con Convex
- `use-admin.ts` - Administración con Convex
- `use-directory.ts` - Directorio de perfiles
- `use-events.ts` - Eventos con Convex
- `use-onboarding.ts` - Onboarding con Convex
- `use-profile.ts` - Perfiles con Convex
- `use-programs.ts` - Programas con Convex
- `use-projects.ts` - Proyectos con Convex
- `use-sessions.ts` - Sesiones con Convex
- `use-skills.ts` - Skills (stub, pendiente datos)

### Archivos Eliminados

- **Database:** `src/lib/db/` (Drizzle connection, queries, schema)
- **API Routes:** Todas las rutas que usaban Drizzle
- **Admin Pages:** `src/app/admin/*`
- **Components:** Componentes viejos de portfolio, profile, admin
- **Services:** Services que usaban la API vieja

## Schema Convex

Ver `convex/schema.ts` para el schema completo. Tablas:

1. `users` - Usuarios con Privy auth
2. `profiles` - Perfiles extendidos
3. `events` - Eventos (sync con Luma)
4. `programs` - Programas de training
5. `sessions` - Sesiones de programas
6. `activities` - Actividades de la comunidad
7. `projects` - Proyectos de miembros
8. `skills` - Taxonomía de skills
9. `applications` - Cola de onboarding
10. `invitations` - Sistema de referidos

## Próximos Pasos

1. **Deploy a producción:**
   ```bash
   bunx convex deploy --prod
   ```

2. **Verificar en Vercel:**
   - Merge `convex-migration` → `main`
   - Vercel auto-deploy

3. **Features pendientes:**
   - Skills: Agregar datos iniciales
   - Enrollments: Agregar tabla para inscripciones
   - Submissions: Agregar tabla para envíos de actividades

## Notas

- El cron de Luma sync está configurado (cada hora)
- Los archivos `_generated` están commiteados (requerido para Vercel)
- El build de producción pasa exitosamente
