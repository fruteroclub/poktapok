"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Code, 
  Eye, 
  Rocket, 
  Loader2, 
  Copy, 
  Check,
  Maximize2,
  Minimize2,
  RefreshCw
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import type { Id } from "../../../../convex/_generated/dataModel";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  code?: string;
  timestamp: Date;
}

interface StudioLayoutProps {
  user: { _id: Id<"users">; username?: string; displayName?: string };
  enrollment: any;
}

export function StudioLayout({ user, enrollment }: StudioLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hola! Soy tu asistente de codigo. Describeme que quieres crear y te ayudo a construirlo. Puedo generar HTML, CSS, y React components.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewCode, setPreviewCode] = useState<string>("");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get user's deployed project
  const deployedProject = useQuery(api.studio.getDeployedProject, {
    userId: user._id,
  });

  const deployProject = useMutation(api.studio.deployProject);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // TODO: Connect to Frutero agent via OpenClaw channel
      // For now, simulate a response
      const response = await fetch("/api/studio/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages,
          userId: user._id,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        code: data.code,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.code) {
        setPreviewCode(data.code);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Hubo un error al procesar tu solicitud. Intenta de nuevo.",
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(previewCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeploy = async () => {
    if (!previewCode) return;

    try {
      await deployProject({
        userId: user._id,
        code: previewCode,
        title: "Mi Proyecto",
      });
    } catch (error) {
      console.error("Error deploying:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">Frutero Studio</h1>
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
              className="text-sm text-orange-600 hover:underline"
            >
              Ver mi deploy
            </a>
          )}
          <Button
            onClick={handleDeploy}
            disabled={!previewCode || isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {deployedProject ? "Actualizar Deploy" : "Deploy"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
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
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.code && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewCode(message.code!)}
                      className="mt-2 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver en preview
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
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
                placeholder="Describe lo que quieres crear..."
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("preview")}
                className={`text-sm ${
                  viewMode === "preview"
                    ? "text-white bg-gray-700"
                    : "text-gray-400"
                }`}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("code")}
                className={`text-sm ${
                  viewMode === "code"
                    ? "text-white bg-gray-700"
                    : "text-gray-400"
                }`}
              >
                <Code className="w-4 h-4 mr-1" />
                Codigo
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {previewCode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className="text-gray-400 hover:text-white"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewCode(previewCode)}
                className="text-gray-400 hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
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
            {viewMode === "preview" ? (
              <iframe
                srcDoc={previewCode || getEmptyPreview()}
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-modals"
                title="Preview"
              />
            ) : (
              <pre className="p-4 text-sm text-gray-300 overflow-auto h-full">
                <code>{previewCode || "// Tu codigo aparecera aqui"}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getEmptyPreview() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #FFF8F0 0%, #FFE4CC 100%);
            color: #666;
          }
          .placeholder {
            text-align: center;
            padding: 2rem;
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          h2 {
            margin: 0 0 0.5rem;
            color: #333;
          }
          p {
            margin: 0;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="placeholder">
          <div class="icon">🍊</div>
          <h2>Frutero Studio</h2>
          <p>Describe tu proyecto en el chat para comenzar</p>
        </div>
      </body>
    </html>
  `;
}
