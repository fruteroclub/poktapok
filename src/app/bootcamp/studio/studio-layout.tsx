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

// Regex to detect tunnel URLs
const TUNNEL_URL_REGEX = /(https?:\/\/[^\s]*(?:trycloudflare\.com|ngrok\.io|ngrok-free\.app|localhost\.run)[^\s]*)/gi;

export function StudioLayout({ user, enrollment }: StudioLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hola! Soy tu asistente de desarrollo. Describeme que proyecto quieres crear y lo construire para ti. Cuando este listo, te dare un link de preview para que lo veas en vivo.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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
    const matches = content.match(TUNNEL_URL_REGEX);
    return matches ? matches[0] : null;
  };

  // Process assistant message for URLs
  const processAssistantMessage = (content: string) => {
    const tunnelUrl = extractTunnelUrl(content);
    if (tunnelUrl) {
      setPreviewUrl(tunnelUrl);
    }
  };

  // Start a new session with the agent
  const startSession = async () => {
    try {
      const response = await fetch("/api/studio/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          userId: user._id,
          enrollmentId: enrollment._id,
        }),
      });
      const data = await response.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        return data.sessionId;
      }
    } catch (error) {
      console.error("Error starting session:", error);
    }
    return null;
  };

  // Poll for new messages from agent
  const pollMessages = async (sid: string) => {
    try {
      const response = await fetch(`/api/studio/session?sessionId=${sid}&action=poll`);
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        const newMessages = data.messages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.timestamp || Date.now()),
        }));
        
        // Add new assistant messages
        newMessages.forEach((msg: Message) => {
          if (msg.role === "assistant") {
            setMessages(prev => {
              // Check if message already exists
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            processAssistantMessage(msg.content);
          }
        });
      }
      
      if (data.isComplete) {
        setIsLoading(false);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  };

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
      // Get or create session
      let sid = sessionId;
      if (!sid) {
        sid = await startSession();
      }

      if (!sid) {
        throw new Error("Could not create session");
      }

      // Send message to agent
      const response = await fetch("/api/studio/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          sessionId: sid,
          message: messageToSend,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Start polling for response
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      pollingRef.current = setInterval(() => pollMessages(sid!), 2000);

    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Hubo un error al procesar tu solicitud. Intenta de nuevo.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeploy = async () => {
    if (!previewUrl) return;

    try {
      const result = await deployProject({
        userId: user._id,
        previewUrl: previewUrl,
        title: "Mi Proyecto VibeCoding",
      });
      
      // Show success feedback
      const deployMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🚀 Proyecto desplegado! Tu link permanente es: ${window.location.origin}/studio/preview/${result.slug}`,
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

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

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
              href={`/studio/preview/${deployedProject.slug}`}
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
                    {message.content.split(TUNNEL_URL_REGEX).map((part, i) => {
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshPreview}
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
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title="Preview"
              />
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
