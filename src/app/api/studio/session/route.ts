import { NextRequest, NextResponse } from "next/server";

/**
 * Studio Session API - Simplified
 * 
 * Connects Poktapok Studio to Frutero Agent (OpenClaw)
 * Uses sessions_send with label - OpenClaw handles session creation automatically
 */

// OpenClaw Gateway configuration
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789";
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

// Simple hash function for consistent port assignment
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, visitorId, message } = body;

    if (!visitorId) {
      return NextResponse.json({ error: "visitorId required" }, { status: 400 });
    }

    const label = `studio-${visitorId}`;
    
    // Calculate unique port for this user (3000-3008)
    const portOffset = Math.abs(hashCode(visitorId)) % 9;
    const userPort = 3000 + portOffset;

    switch (action) {
      case "start":
        // Just spawn a new session with assigned port
        return handleSpawnSession(label, userPort);
      case "send":
        // Send message - will auto-create session if needed
        return handleSendMessage(label, message, userPort);
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
    return handleGetHistory(`studio-${visitorId}`);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

async function handleSpawnSession(label: string, userPort: number) {
  try {
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        tool: "sessions_spawn",
        args: {
          label,
          task: getStudioAgentTask(userPort),
          cleanup: "keep",
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

    return NextResponse.json({ 
      ok: true,
      sessionKey: data.result?.sessionKey || label,
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

async function handleSendMessage(label: string, message: string, userPort: number) {
  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  try {
    // First try to send to existing session
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        tool: "sessions_send",
        args: {
          label,
          message,
          timeoutSeconds: 300, // 5 min for project creation
        },
      }),
    });

    const data = await response.json();
    
    // If session doesn't exist, create it and retry
    // Error can be in data.error.message OR data.result.details.error (gateway format)
    const errorMsg = (
      data.error?.message || 
      data.error || 
      data.result?.details?.error || 
      ""
    ).toString().toLowerCase();
    
    // Handle "multiple sessions" by just retrying send (one will work)
    if (errorMsg.includes("multiple sessions")) {
      // Extract first session key from error and use sessionKey instead of label
      const match = errorMsg.match(/\(([^,]+)/);
      if (match) {
        const sessionKey = match[1];
        const retryResponse = await fetch(`${OPENCLAW_GATEWAY_URL}/tools/invoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            tool: "sessions_send",
            args: {
              sessionKey,
              message,
              timeoutSeconds: 300,
            },
          }),
        });
        const retryData = await retryResponse.json();
        return NextResponse.json({ 
          ok: true,
          response: retryData.result,
        });
      }
    }
    
    if (errorMsg.includes("not found") || errorMsg.includes("no session")) {
      console.log("Session not found, spawning new one...");
      const spawnResult = await handleSpawnSession(label, userPort);
      const spawnData = await spawnResult.json();
      
      if (!spawnData.ok) {
        return NextResponse.json(spawnData, { status: 500 });
      }

      // Retry send after spawn
      const retryResponse = await fetch(`${OPENCLAW_GATEWAY_URL}/tools/invoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          tool: "sessions_send",
          args: {
            label,
            message,
            timeoutSeconds: 300,
          },
        }),
      });

      const retryData = await retryResponse.json();
      
      if (!retryResponse.ok || !retryData.ok) {
        console.error("OpenClaw retry send error:", retryData);
        return NextResponse.json({ 
          ok: false, 
          error: retryData.error?.message || "Failed to send message" 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        ok: true,
        response: retryData.result,
      });
    }

    if (!response.ok || !data.ok) {
      console.error("OpenClaw send error:", data);
      return NextResponse.json({ 
        ok: false, 
        error: data.error?.message || "Failed to send message" 
      }, { status: 500 });
    }

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

async function handleGetHistory(label: string) {
  try {
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        tool: "sessions_history",
        args: {
          label,
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
function getStudioAgentTask(userPort: number): string {
  return `Eres un asistente de desarrollo para estudiantes del VibeCoding Bootcamp de Frutero Club.

## TU PUERTO ASIGNADO: ${userPort}
IMPORTANTE: Usa SIEMPRE el puerto ${userPort} para este estudiante. No uses otro puerto.

Tu trabajo es ayudar a los estudiantes a crear proyectos web completos con preview en vivo.

## IMPORTANTE: Sé EXPLÍCITO con los estudiantes
Los estudiantes son principiantes. Siempre dales TODOS los links y explica qué es cada uno:
- 📁 **GitHub:** donde vive su código (pueden verlo, editarlo, compartirlo)
- 🌐 **Preview:** link temporal para ver el proyecto funcionando
- 🚀 **Vercel:** si quieren deploy permanente, diles que conecten su GitHub a vercel.com

## Flujo de trabajo

### 1. Crear proyecto
- Directorio: /home/scarf/.openclaw/workspace/proyectos/<nombre-proyecto>
- Usa bun (NUNCA npm): bunx create-next-app@latest <nombre> --typescript --tailwind --app --use-bun

### 2. GitHub (EXPLICAR AL ESTUDIANTE)
- git init && git add . && git commit -m "initial commit"
- gh repo create Scarfdrilo/<nombre-proyecto> --public --source=. --push
- SIEMPRE dile al estudiante: "Tu código está en: https://github.com/Scarfdrilo/<nombre-proyecto>"

### 3. Preview con tunnel
- bun run dev --port ${userPort} &
- cloudflared tunnel --url http://localhost:${userPort} 2>&1 | tee /tmp/tunnel-${userPort}.log &
- Extraer y verificar URL (curl debe dar 200)

### 4. AL TERMINAR, da este resumen SIEMPRE:

---
🎉 **¡Tu proyecto está listo!**

📁 **Tu código (GitHub):** https://github.com/Scarfdrilo/<nombre>

🌐 **Preview:** https://xxx.trycloudflare.com

🚀 **Deploy permanente:** Da click en el botón "Ver mi deploy" para publicar tu proyecto en Vercel
---

### 5. SOLO UN PROYECTO POR ESTUDIANTE
- NO permitas crear otro proyecto
- Si piden otro, diles: "En este bootcamp trabajamos con un solo proyecto. ¡Vamos a hacer que este quede increíble! ¿Qué mejoras le quieres hacer?"
- Enfócate en mejorar el proyecto actual: agregar features, cambiar estilos, etc.

## Reglas
- Español mexicano, amigable
- Emojis con moderación
- URLs SIN asteriscos ni markdown (el frontend las detecta)
- Muestra progreso: ✓ Proyecto creado, ✓ GitHub listo, ✓ Preview funcionando
- Si algo falla, reintenta automáticamente
- SIEMPRE da el resumen con los 3 links al terminar`;
}
