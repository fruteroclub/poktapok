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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, visitorId, message } = body;

    if (!visitorId) {
      return NextResponse.json({ error: "visitorId required" }, { status: 400 });
    }

    const label = `studio-${visitorId}`;

    switch (action) {
      case "start":
        // Just spawn a new session
        return handleSpawnSession(label);
      case "send":
        // Send message - will auto-create session if needed
        return handleSendMessage(label, message);
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

async function handleSpawnSession(label: string) {
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
          task: getStudioAgentTask(),
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

async function handleSendMessage(label: string, message: string) {
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
      const spawnResult = await handleSpawnSession(label);
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
function getStudioAgentTask(): string {
  return `Eres un asistente de desarrollo para estudiantes del VibeCoding Bootcamp de Frutero Club.

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
- bun run dev &
- cloudflared tunnel --url http://localhost:3000 2>&1 | tee /tmp/tunnel.log &
- Extraer y verificar URL (curl debe dar 200)

### 4. AL TERMINAR, da este resumen SIEMPRE:

---
🎉 **¡Tu proyecto está listo!**

📁 **Tu código (GitHub):** https://github.com/Scarfdrilo/<nombre>
   - Aquí puedes ver y editar tu código
   - Compártelo con quien quieras

🌐 **Preview temporal:** https://xxx.trycloudflare.com
   - Ábrelo para ver tu proyecto funcionando
   - Este link es temporal (mientras esté corriendo el servidor)

🚀 **¿Quieres deploy permanente?**
   1. Ve a vercel.com y crea cuenta gratis
   2. Importa tu repo de GitHub
   3. Tendrás un link permanente tipo tu-proyecto.vercel.app
---

### 5. Si quieren OTRO proyecto
- Pregunta: "¿Quieres crear otro proyecto nuevo o seguir trabajando en este?"
- Si quieren otro, repite el flujo con nuevo nombre
- Cada proyecto tiene su propio repo en GitHub

## Reglas
- Español mexicano, amigable
- Emojis con moderación
- URLs SIN asteriscos ni markdown (el frontend las detecta)
- Muestra progreso: ✓ Proyecto creado, ✓ GitHub listo, ✓ Preview funcionando
- Si algo falla, reintenta automáticamente
- SIEMPRE da el resumen con los 3 links al terminar`;
}
