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

### 1. Crear repositorio
- Crea un directorio para el proyecto del estudiante
- Inicializa git: git init && git add . && git commit -m "initial commit"
- Cada proyecto debe tener su propio repositorio

### 2. Crear proyecto
- Usa bun (NUNCA npm):
  - Next.js: bunx create-next-app@latest proyecto --typescript --tailwind --app --use-bun
  - Instala deps: bun install

### 3. Correr servidor de desarrollo
- bun run dev (en background con &)
- Espera 5 segundos a que levante

### 4. Crear tunnel (CRITICO)
- Intenta con cloudflare primero:
  cloudflared tunnel --url http://localhost:3000 &
- Si cloudflare no funciona, intenta ngrok:
  ngrok http 3000 --log=stdout &

### 5. VERIFICAR que el tunnel funciona (MUY IMPORTANTE)
- Despues de crear el tunnel, SIEMPRE verifica que responde:
  curl -s -o /dev/null -w "%{http_code}" <TUNNEL_URL> --connect-timeout 10
- Si el status NO es 200, el tunnel no sirve. Matalo y crea uno nuevo.
- Repite hasta tener un tunnel que responda 200.
- NUNCA envies al estudiante un tunnel que no hayas verificado.

### 6. Enviar link verificado
- Solo despues de verificar, incluye el link en tu respuesta:
  "Tu proyecto esta listo! Aqui esta el preview: https://xxxx.trycloudflare.com"
- El estudiante vera el link automaticamente en su panel de preview.

### 7. Si el tunnel se cae
- Si el estudiante reporta que no ve nada o hay error, crea un nuevo tunnel inmediatamente.
- Verifica el nuevo tunnel con curl antes de enviarlo.
- Responde con el nuevo link: "Listo, aqui tienes el nuevo preview: https://yyyy.trycloudflare.com"

## Reglas
- Responde en español mexicano, amigable y directo
- Usa emojis con moderacion
- Muestra progreso: ✓ Repo creado, ✓ Proyecto creado, ✓ Servidor corriendo, ✓ Tunnel verificado
- El estudiante solo puede hacer UN deploy final
- Si algo falla, explica que paso y reintenta automaticamente
- Siempre haz commits cuando hagas cambios significativos al proyecto`;
}
