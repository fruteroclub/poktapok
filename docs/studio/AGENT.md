# Frutero Studio - AI Project Builder Skill

## Contexto

El Studio es una UI de chat split-panel (chat izquierda + iframe preview derecha) en https://frutero.club/bootcamp/studio. Los estudiantes del VibeCoding Bootcamp chatean con el agente para crear proyectos web y verlos en vivo.

## Cómo funciona la conexión

1. Frontend manda mensajes via `POST /api/studio/session` con `action: "send"`
2. El API route llama a OpenClaw `/tools/invoke` con `tool: "sessions_send"`
3. La respuesta del agente se extrae de `data.result.details.reply` (texto limpio)
4. El frontend busca URLs de tunnel con este regex:
   ```
   /(https?:\/\/[^\s]*(?:trycloudflare\.com|ngrok\.io|ngrok-free\.app|localhost\.run)[^\s]*)/gi
   ```
5. Si encuentra un tunnel URL, verifica que responda antes de cargarlo en el iframe

## Lo que el frontend espera del agente

### Formato de respuesta
- Texto plano en español
- Las URLs de tunnel se detectan automáticamente

### URLs de tunnel soportadas
- `*.trycloudflare.com`
- `*.ngrok.io`
- `*.ngrok-free.app`
- `*.localhost.run`

## Flujo que el agente DEBE seguir

1. **Crear repo git** para cada proyecto (`git init` + commit inicial)
2. **Crear proyecto con bun** (NUNCA npm)
3. **Correr dev server** en background
4. **Crear tunnel** (cloudflare o ngrok)
5. **VERIFICAR** el tunnel funciona:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" <URL> --connect-timeout 10
   ```
   — debe ser 200
6. **Solo enviar URL verificada** al estudiante
7. **Si el tunnel se cae**: crear uno nuevo, verificar, y enviar el nuevo link

### Timeout
- 5 minutos (300s) por mensaje — suficiente para crear proyecto + tunnel

## Status del tunnel en el frontend

- 🟢 Punto verde = live (iframe cargado)
- 🟡 Punto amarillo pulsando = verificando
- 🔴 Punto rojo = muerto (muestra botón "Reintentar" + mensaje "pide al agente un nuevo tunnel")

## Estado actual del preview panel

- **Sin URL**: Muestra "Preview de tu proyecto" + placeholder
- **Verificando**: Muestra spinner "Verificando tunnel..."
- **Live**: Carga iframe con el tunnel
- **Dead**: Muestra "Tunnel no disponible" + botón reintentar

## Comandos para crear proyectos

### Next.js con bun
```bash
# Crear proyecto
cd /tmp/studio-projects
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
bunx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-git --use-bun

# Inicializar git
git init
git add -A
git commit -m "Initial commit"

# Instalar dependencias
bun install

# Correr dev server en background
bun run dev &
DEV_PID=$!
sleep 5

# Crear tunnel
cloudflared tunnel --url http://localhost:3000 2>&1 &
sleep 8

# Obtener URL del tunnel
TUNNEL_URL=$(grep -o 'https://[^[:space:]]*trycloudflare.com' /tmp/tunnel.log | head -1)

# VERIFICAR antes de enviar
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$TUNNEL_URL" --connect-timeout 10)
if [ "$HTTP_CODE" = "200" ]; then
    echo "Tu proyecto esta listo! Preview: $TUNNEL_URL"
else
    echo "Error: tunnel no responde, reintentando..."
fi
```

## Respuesta ejemplo

```
✓ Proyecto creado con bun
✓ Servidor corriendo en localhost:3000
✓ Tunnel activo y verificado

**Tu proyecto está listo!** 🎉

**Preview:** https://algo-random.trycloudflare.com

¿Qué quieres que le agreguemos?
```

## Notas importantes

1. **SIEMPRE usar bun** - nunca npm (más rápido, menos recursos)
2. **SIEMPRE verificar tunnel** antes de enviar URL
3. **Puerto 3000** es default, usar diferente si está ocupado
4. **Un deploy por estudiante** - pueden iterar infinito pero solo deploy final una vez
5. **Si tunnel muere** - crear nuevo y avisar al estudiante
6. **Responder en español mexicano** - amigable y directo
