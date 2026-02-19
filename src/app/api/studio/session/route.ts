import { NextRequest, NextResponse } from "next/server";

/**
 * Studio Session API
 * 
 * Connects Poktapok Studio to Frutero Agent (OpenClaw)
 * 
 * Actions:
 * - start: Create a new session with the agent
 * - send: Send a message to the agent
 * - poll: Get new messages from the agent
 * 
 * The agent is configured to:
 * - Create Next.js/React projects with bun
 * - Run bun dev locally
 * - Create cloudflare tunnels
 * - Send tunnel URLs to students
 */

// In-memory session store (replace with Redis/DB in production)
const sessions = new Map<string, {
  userId: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>;
  isProcessing: boolean;
  lastPollIndex: number;
}>();

// OpenClaw Gateway configuration
const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789";
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, enrollmentId, sessionId, message } = body;

    switch (action) {
      case "start":
        return handleStartSession(userId, enrollmentId);
      case "send":
        return handleSendMessage(sessionId, message, userId);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Studio session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const action = searchParams.get("action");

  if (action === "poll" && sessionId) {
    return handlePollMessages(sessionId);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

async function handleStartSession(userId: string, enrollmentId: string) {
  // Generate session ID
  const sessionId = `studio-${userId}-${Date.now()}`;
  
  // Initialize session
  sessions.set(sessionId, {
    userId,
    messages: [],
    isProcessing: false,
    lastPollIndex: 0,
  });

  // TODO: Connect to OpenClaw and create agent session
  // For now, we'll use the local gateway
  
  try {
    // Try to spawn a sub-agent session for this student
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/api/sessions/spawn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        label: `studio-${userId}`,
        task: getAgentSystemPrompt(userId),
        agentId: "frutero-studio", // The agent configured for studio work
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Store the OpenClaw session key
      const session = sessions.get(sessionId);
      if (session) {
        (session as any).openclawSessionKey = data.sessionKey;
      }
    }
  } catch (error) {
    console.log("OpenClaw gateway not available, using standalone mode");
  }

  return NextResponse.json({ 
    sessionId,
    message: "Session started" 
  });
}

async function handleSendMessage(sessionId: string, message: string, userId: string) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Add user message
  const userMsg = {
    id: `msg-${Date.now()}`,
    role: "user" as const,
    content: message,
    timestamp: Date.now(),
  };
  session.messages.push(userMsg);
  session.isProcessing = true;

  // Try to send to OpenClaw agent
  const openclawSessionKey = (session as any).openclawSessionKey;
  
  if (openclawSessionKey) {
    try {
      await fetch(`${OPENCLAW_GATEWAY_URL}/api/sessions/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        },
        body: JSON.stringify({
          sessionKey: openclawSessionKey,
          message,
        }),
      });
    } catch (error) {
      console.error("Error sending to OpenClaw:", error);
    }
  } else {
    // Fallback: Generate mock response for demo/testing
    setTimeout(() => {
      generateMockResponse(sessionId, message);
    }, 2000);
  }

  return NextResponse.json({ success: true });
}

async function handlePollMessages(sessionId: string) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Get new messages since last poll
  const newMessages = session.messages.slice(session.lastPollIndex);
  session.lastPollIndex = session.messages.length;

  // If connected to OpenClaw, try to get new messages
  const openclawSessionKey = (session as any).openclawSessionKey;
  
  if (openclawSessionKey) {
    try {
      const response = await fetch(
        `${OPENCLAW_GATEWAY_URL}/api/sessions/history?sessionKey=${openclawSessionKey}&limit=10`,
        {
          headers: {
            "Authorization": `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Process and add any new assistant messages
        // ...
      }
    } catch (error) {
      console.error("Error polling OpenClaw:", error);
    }
  }

  return NextResponse.json({
    messages: newMessages,
    isComplete: !session.isProcessing,
  });
}

// Mock response generator for testing without OpenClaw
function generateMockResponse(sessionId: string, userMessage: string) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const lowerMessage = userMessage.toLowerCase();
  let response = "";

  if (lowerMessage.includes("landing") || lowerMessage.includes("pagina")) {
    response = `Perfecto! Voy a crear una landing page para ti.

Creando proyecto con bun...
✓ Proyecto creado
✓ Instalando dependencias con bun install
✓ Ejecutando bun run dev
✓ Creando tunnel con cloudflare...

Tu proyecto esta listo! Aqui esta el preview:
https://demo-landing-${Date.now()}.trycloudflare.com

Puedes ver tu landing page en el panel de la derecha. Si quieres cambios, solo dimelos!`;
  } else if (lowerMessage.includes("boton") || lowerMessage.includes("color") || lowerMessage.includes("cambiar")) {
    response = `Entendido! Haciendo los cambios...

✓ Actualizando codigo
✓ Hot reload activo

Los cambios ya estan reflejados en el preview. Que te parece?`;
  } else if (lowerMessage.includes("deploy") || lowerMessage.includes("publicar")) {
    response = `Para hacer deploy permanente, usa el boton "Deploy" arriba a la derecha. 
    
Esto guardara tu proyecto y te dara un link permanente que podras compartir.

Nota: Solo puedes hacer un deploy, asi que asegurate de que todo este como lo quieres!`;
  } else {
    response = `Entendido! Estoy trabajando en tu solicitud...

¿Que tipo de proyecto te gustaria crear?
- Una landing page
- Un formulario de contacto
- Una galeria de proyectos
- Un dashboard

Solo dime que necesitas y lo creo para ti!`;
  }

  // Add assistant message
  session.messages.push({
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: response,
    timestamp: Date.now(),
  });
  
  session.isProcessing = false;
}

// System prompt for the Frutero Studio agent
function getAgentSystemPrompt(userId: string): string {
  return `Eres el agente de Frutero Studio, un asistente de desarrollo para estudiantes del VibeCoding Bootcamp.

Tu trabajo es:
1. Escuchar lo que el estudiante quiere crear
2. Crear el proyecto usando bun (no npm)
3. Correr el proyecto localmente con bun run dev
4. Crear un tunnel con cloudflare para que el estudiante vea el preview
5. Enviar el link del tunnel al estudiante

Cuando crees un proyecto:
- Usa bun create next-app o similar
- Instala dependencias con bun install
- Corre el dev server con bun run dev
- Crea tunnel con: cloudflared tunnel --url http://localhost:3000
- Comparte el link del tunnel

El estudiante solo puede hacer UN deploy, asi que asegurate de que este satisfecho antes de sugerirle que haga deploy.

Siempre incluye el link del tunnel en tu respuesta cuando el proyecto este listo, en formato:
https://xxxxx.trycloudflare.com

Responde en español mexicano, de forma amigable y directa.`;
}
