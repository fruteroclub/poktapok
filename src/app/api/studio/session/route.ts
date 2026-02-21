import { NextRequest, NextResponse } from "next/server";

/**
 * Studio Session API
 * 
 * Connects Poktapok Studio to Frutero Agent (OpenClaw)
 * Uses /tools/invoke endpoint to call sessions_spawn and sessions_send
 */

// OpenClaw Gateway configuration
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789";
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

// In-memory session store (maps visitorId -> openclawSessionKey)
const sessionStore = new Map<string, {
  openclawSessionKey: string;
  createdAt: number;
}>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, visitorId, message } = body;

    switch (action) {
      case "start":
        return handleStartSession(visitorId);
      case "send":
        return handleSendMessage(visitorId, message);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Studio session error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const visitorId = searchParams.get("visitorId");
  const action = searchParams.get("action");

  if (action === "history" && visitorId) {
    return handleGetHistory(visitorId);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

async function handleStartSession(visitorId: string) {
  if (!visitorId) {
    return NextResponse.json({ error: "visitorId required" }, { status: 400 });
  }

  // Check if session already exists
  const existing = sessionStore.get(visitorId);
  if (existing) {
    return NextResponse.json({ 
      ok: true,
      sessionKey: existing.openclawSessionKey,
      message: "Session already exists" 
    });
  }

  try {
    // Spawn a new sub-agent session via OpenClaw
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        tool: "sessions_spawn",
        args: {
          label: `studio-${visitorId}`,
          task: getStudioAgentTask(),
          cleanup: "keep", // Keep session for follow-up messages
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      console.error("OpenClaw spawn error:", data);
      return NextResponse.json({ 
        ok: false, 
        error: data.error?.message || "Failed to create session" 
      }, { status: 500 });
    }

    // Store session mapping
    const sessionKey = data.result?.sessionKey || `studio-${visitorId}`;
    sessionStore.set(visitorId, {
      openclawSessionKey: sessionKey,
      createdAt: Date.now(),
    });

    return NextResponse.json({ 
      ok: true,
      sessionKey,
      message: "Session created" 
    });

  } catch (error) {
    console.error("OpenClaw connection error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Could not connect to agent",
      details: String(error)
    }, { status: 500 });
  }
}

async function handleSendMessage(visitorId: string, message: string) {
  if (!visitorId || !message) {
    return NextResponse.json({ error: "visitorId and message required" }, { status: 400 });
  }

  // Get or create session
  let session = sessionStore.get(visitorId);
  
  if (!session) {
    // Auto-create session
    const startResult = await handleStartSession(visitorId);
    const startData = await startResult.json();
    
    if (!startData.ok) {
      return NextResponse.json(startData, { status: 500 });
    }
    
    session = sessionStore.get(visitorId);
  }

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    // Send message to the session via OpenClaw
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        tool: "sessions_send",
        args: {
          label: `studio-${visitorId}`,
          message: message,
          timeoutSeconds: 300, // 5 min timeout for project creation + tunnel verification
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      console.error("OpenClaw send error:", data);
      return NextResponse.json({ 
        ok: false, 
        error: data.error?.message || "Failed to send message" 
      }, { status: 500 });
    }

    // sessions_send returns the response directly
    return NextResponse.json({ 
      ok: true,
      response: data.result,
    });

  } catch (error) {
    console.error("OpenClaw send error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Could not send message",
      details: String(error)
    }, { status: 500 });
  }
}

async function handleGetHistory(visitorId: string) {
  const session = sessionStore.get(visitorId);
  
  if (!session) {
    return NextResponse.json({ ok: true, messages: [] });
  }

  try {
    // Get history via OpenClaw
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        tool: "sessions_history",
        args: {
          label: `studio-${visitorId}`,
          limit: 50,
          includeTools: false,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.ok) {
      return NextResponse.json({ ok: true, messages: [] });
    }

    return NextResponse.json({ 
      ok: true,
      messages: data.result || [],
    });

  } catch (error) {
    console.error("OpenClaw history error:", error);
    return NextResponse.json({ ok: true, messages: [] });
  }
}

// The task/prompt for the Studio agent
function getStudioAgentTask(): string {
  return `Eres un asistente de desarrollo para estudiantes del VibeCoding Bootcamp de Frutero Club.

Tu trabajo es ayudar a los estudiantes a crear proyectos web completos con preview en vivo.

## Flujo de trabajo

### 1. Crear proyecto en directorio dedicado
- Crea el proyecto en: /home/scarf/.openclaw/workspace/proyectos/<nombre-proyecto>
- Usa bun (NUNCA npm):
  - Next.js: bunx create-next-app@latest <nombre> --typescript --tailwind --app --use-bun
  - Instala deps: bun install

### 2. Inicializar Git y GitHub
- git init && git add . && git commit -m "initial commit"
- Crea repo en GitHub: gh repo create Scarfdrilo/<nombre-proyecto> --public --source=. --push
- Si falla el push, intenta: git push -u origin main

### 3. Correr servidor de desarrollo
- bun run dev (en background con &)
- Espera 5 segundos a que levante

### 4. Crear tunnel (CRITICO)
- Usa cloudflared:
  cloudflared tunnel --url http://localhost:3000 2>&1 | tee /tmp/tunnel.log &
- Espera 5 segundos y extrae la URL del log:
  grep -oE "https://[a-z0-9-]+\\.trycloudflare\\.com" /tmp/tunnel.log | head -1

### 5. VERIFICAR que el tunnel funciona (MUY IMPORTANTE)
- SIEMPRE verifica que responde:
  curl -s -o /dev/null -w "%{http_code}" <TUNNEL_URL> --connect-timeout 10
- Si el status NO es 200, mata el tunnel y crea uno nuevo.
- Repite hasta tener un tunnel que responda 200.
- NUNCA envies un tunnel que no hayas verificado.

### 6. Enviar link verificado
- IMPORTANTE: Escribe el URL limpio, SIN asteriscos, SIN markdown alrededor
- Formato correcto: "Tu preview: https://xxxx.trycloudflare.com"
- Formato INCORRECTO: "Tu preview: **https://xxxx.trycloudflare.com**" (NO hagas esto)
- El frontend detecta URLs automaticamente, no necesita formato especial

### 7. Si el tunnel se cae
- Si el estudiante reporta error, crea nuevo tunnel inmediatamente
- Verifica con curl antes de enviar
- Responde con URL limpia sin markdown

## Reglas
- Responde en español mexicano, amigable y directo
- Usa emojis con moderacion
- Muestra progreso: ✓ Proyecto creado, ✓ GitHub repo, ✓ Servidor corriendo, ✓ Tunnel verificado
- URLs siempre limpias, sin asteriscos ni formato markdown
- Haz commits cuando hagas cambios significativos
- Si algo falla, explica y reintenta automaticamente`;
}
