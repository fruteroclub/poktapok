"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Eye, 
  Rocket, 
  Loader2, 
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Globe
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Navbar from "@/components/layout/navbar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface StudioLayoutProps {
  user: { _id: Id<"users">; username?: string; displayName?: string };
  enrollment: any;
}

// Regex to detect tunnel URLs - stops at markdown chars, parentheses, brackets
const TUNNEL_URL_REGEX = /(https?:\/\/[a-z0-9-]+\.(?:trycloudflare\.com|ngrok\.io|ngrok-free\.app|localhost\.run)(?:\/[^\s\)\]\*\`\<\>]*)?)/gi;

export function StudioLayout({ user, enrollment }: StudioLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! Soy tu asistente de desarrollo. Descríbeme qué proyecto quieres crear y lo construiré para ti. Cuando esté listo, te daré un link de preview para que lo veas en vivo.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [tunnelStatus, setTunnelStatus] = useState<"idle" | "checking" | "live" | "dead" | "recovering">("idle");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visitorId] = useState<string>(() => `${user._id}-${Date.now()}`);
  const [tunnelRetryCount, setTunnelRetryCount] = useState(0);
  const maxTunnelRetries = 3;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get user's deployed project
  const deployedProject = useQuery(api.studio.getDeployedProject, {
    userId: user._id,
  });

  const deployProject = useMutation(api.studio.deployProject);
  const savePreviewUrl = useMutation(api.studio.savePreviewUrl);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract tunnel URLs from message content
  const extractTunnelUrl = (content: string): string | null => {
    if (typeof content !== "string") return null;
    const matches = content.match(TUNNEL_URL_REGEX);
    return matches ? matches[0] : null;
  };

  // Check if a tunnel URL is alive
  const checkTunnelHealth = async (url: string): Promise<boolean> => {
    setTunnelStatus("checking");
    try {
      // Use no-cors mode — we can't read the response but we know it didn't throw
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      await fetch(url, { mode: "no-cors", signal: controller.signal });
      clearTimeout(timeout);
      setTunnelStatus("live");
      return true;
    } catch {
      setTunnelStatus("dead");
      return false;
    }
  };

  // Process assistant message for URLs
  const processAssistantMessage = async (content: string) => {
    const tunnelUrl = extractTunnelUrl(content);
    if (tunnelUrl) {
      setPreviewUrl(tunnelUrl);
      setTunnelRetryCount(0); // Reset retry count on new URL
      await checkTunnelHealth(tunnelUrl);
    }
  };

  // Auto-request new tunnel when current one dies
  const requestNewTunnel = async () => {
    if (isLoading || tunnelRetryCount >= maxTunnelRetries) return;
    
    setTunnelStatus("recovering");
    setTunnelRetryCount(prev => prev + 1);
    
    // Add system message to show user we're recovering
    const recoveryMessage: Message = {
      id: `recovery-${Date.now()}`,
      role: "assistant",
      content: `🔄 El preview se desconectó. Reconectando automáticamente... (intento ${tunnelRetryCount + 1}/${maxTunnelRetries})`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, recoveryMessage]);
    
    try {
      const response = await fetch("/api/studio/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          visitorId: visitorId,
          message: "El tunnel del preview se cayó. Por favor genera un nuevo tunnel para el mismo proyecto y envíame la nueva URL.",
        }),
      });

      const data = await response.json();

      if (data.ok) {
        const raw = data.response;
        const assistantContent: string =
          (typeof raw?.details?.reply === "string" && raw.details.reply) ||
          (Array.isArray(raw?.content) && typeof raw.content[0]?.text === "string" && raw.content[0].text) ||
          (typeof raw === "string" && raw) ||
          "Reconectando...";
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: assistantContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        processAssistantMessage(assistantContent);
      }
    } catch (error) {
      console.error("Error recovering tunnel:", error);
      setTunnelStatus("dead");
    }
  };

  // Auto-trigger recovery when tunnel dies
  useEffect(() => {
    if (tunnelStatus === "dead" && previewUrl && tunnelRetryCount < maxTunnelRetries && !isLoading) {
      const timeout = setTimeout(() => {
        requestNewTunnel();
      }, 2000); // Wait 2 seconds before auto-retry
      return () => clearTimeout(timeout);
    }
  }, [tunnelStatus, previewUrl, tunnelRetryCount, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput("");
    setIsLoading(true);

    try {
      // Send message to agent (API handles session creation automatically)
      // Use AbortController with 5 minute timeout for long-running project creation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutes
      
      const response = await fetch("/api/studio/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          visitorId: visitorId,
          message: messageToSend,
        }),
        signal: controller.signal,
        keepalive: true,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Extract reply text from OpenClaw response structure
      const raw = data.response;
      const assistantContent: string =
        // Try details.reply first (clean text)
        (typeof raw?.details?.reply === "string" && raw.details.reply) ||
        // Try content[0].text (MCP format)
        (Array.isArray(raw?.content) && typeof raw.content[0]?.text === "string" && raw.content[0].text) ||
        // Try raw as string directly
        (typeof raw === "string" && raw) ||
        // Fallback
        "Procesando...";
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      processAssistantMessage(assistantContent);

    } catch (error) {
      console.error("Error:", error);
      let errorText = "Intenta de nuevo.";
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorText = "La solicitud tardó demasiado. El agente puede estar ocupado creando tu proyecto. Espera un momento y pregunta por el status.";
        } else if (error.message.includes("NetworkError") || error.message.includes("fetch")) {
          errorText = "Error de conexión. Reintentando...";
          // Auto-retry once after 2 seconds
          setTimeout(() => {
            setInput(messageToSend);
          }, 2000);
        } else {
          errorText = error.message;
        }
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Hubo un error: ${errorText}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Extract GitHub repo name from messages
  const extractGitHubRepo = (): string => {
    const allContent = messages.map(m => m.content).join(" ");
    const match = allContent.match(/github\.com\/Scarfdrilo\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : "mi-proyecto";
  };

  const handleDeploy = async () => {
    if (!previewUrl) return;

    try {
      const repoName = extractGitHubRepo();
      const result = await deployProject({
        userId: user._id,
        previewUrl: previewUrl,
        title: repoName,
      });
      
      // Show success with Vercel link
      const deployMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🚀 ¡Deploy listo! Da click en "Ver mi deploy" para publicar tu proyecto en Vercel con un link permanente.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, deployMessage]);
    } catch (error) {
      console.error("Error deploying:", error);
    }
  };

  const handleRefreshPreview = () => {
    // Force iframe refresh by adding timestamp
    if (previewUrl) {
      const url = new URL(previewUrl);
      url.searchParams.set("_t", Date.now().toString());
      setPreviewUrl(url.toString());
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8F0]">
      {/* Main Navbar */}
      <Navbar />
      
      {/* Studio Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-24 z-30">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-800">Studio</h1>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Beta
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          {deployedProject && (
            <a
              href={`https://vercel.com/new/import?s=https://github.com/Scarfdrilo/${deployedProject.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:underline flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              Ver mi deploy
            </a>
          )}
          <Button
            onClick={handleDeploy}
            disabled={!previewUrl || isLoading || !!deployedProject}
            className="bg-orange-500 hover:bg-orange-600"
            size="sm"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {deployedProject ? "Ya desplegado" : "Deploy"}
          </Button>
        </div>
      </header>

      {/* Main Content - height minus navbar (96px) and studio header (~52px) */}
      <div className="flex overflow-hidden" style={{ height: "calc(100vh - 148px)" }}>
        {/* Chat Panel */}
        <div className={`flex flex-col ${isFullscreen ? "hidden" : "w-1/2"} border-r bg-white`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {String(message.content).split(TUNNEL_URL_REGEX).map((part, i) => {
                      if (TUNNEL_URL_REGEX.test(part)) {
                        return (
                          <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800 inline-flex items-center gap-1"
                            onClick={(e) => {
                              e.preventDefault();
                              setPreviewUrl(part);
                            }}
                          >
                            {part}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      }
                      return part;
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-gray-500 text-sm">Trabajando en tu proyecto...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe tu proyecto o pide cambios..."
                className="min-h-[60px] max-h-[200px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-orange-500 hover:bg-orange-600 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Presiona Enter para enviar, Shift+Enter para nueva linea
            </p>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`flex flex-col ${isFullscreen ? "w-full" : "w-1/2"} bg-gray-900`}>
          {/* Preview Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Preview</span>
              {previewUrl && (
                <span className="text-xs text-gray-500 truncate max-w-[200px]">
                  {previewUrl}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {previewUrl && (
                <>
                  {/* Tunnel status indicator */}
                  <span className={`w-2 h-2 rounded-full ${
                    tunnelStatus === "live" ? "bg-green-400" :
                    tunnelStatus === "checking" ? "bg-yellow-400 animate-pulse" :
                    tunnelStatus === "recovering" ? "bg-orange-400 animate-pulse" :
                    tunnelStatus === "dead" ? "bg-red-400" :
                    "bg-gray-400"
                  }`} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleRefreshPreview();
                      checkTunnelHealth(previewUrl);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-gray-400 hover:text-white"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-hidden">
            {previewUrl && tunnelStatus === "live" ? (
              <iframe
                src={previewUrl}
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title="Preview"
              />
            ) : previewUrl && tunnelStatus === "checking" ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center p-8">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-orange-500 animate-spin" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Verificando tunnel...
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Comprobando que el preview esta disponible.
                  </p>
                </div>
              </div>
            ) : previewUrl && tunnelStatus === "recovering" ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center p-8">
                  <RefreshCw className="w-16 h-16 mx-auto mb-4 text-orange-400 animate-spin" />
                  <h3 className="text-lg font-medium text-orange-300 mb-2">
                    Reconectando preview...
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    El tunnel se desconectó. Generando uno nuevo automáticamente.
                    {tunnelRetryCount > 0 && (
                      <span className="block mt-2 text-gray-600">
                        Intento {tunnelRetryCount} de {maxTunnelRetries}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ) : previewUrl && tunnelStatus === "dead" ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center p-8">
                  <Globe className="w-16 h-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-lg font-medium text-red-300 mb-2">
                    Tunnel no disponible
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-4">
                    {tunnelRetryCount >= maxTunnelRetries 
                      ? "Se agotaron los reintentos automáticos. Pide al agente que genere un nuevo tunnel."
                      : "El preview no responde. Pide al agente que genere un nuevo tunnel."
                    }
                  </p>
                  <Button
                    onClick={() => {
                      setTunnelRetryCount(0);
                      requestNewTunnel();
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center p-8">
                  <Globe className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Preview de tu proyecto
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Cuando el agente tenga tu proyecto listo, aparecera aqui el preview en vivo.
                    Describe que quieres crear en el chat.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
