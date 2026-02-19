"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ExternalLink, Loader2 } from "lucide-react";

export default function StudioPreviewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.studio.getProjectBySlug, { slug });

  if (project === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8F0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="text-gray-500">Cargando proyecto...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8F0] p-8">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-gray-600 text-center mb-6">
          Este proyecto no existe o ha sido eliminado.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-orange-500 font-bold text-lg">🍊 Frutero Studio</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700 font-medium">{project.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Creado {new Date(project.createdAt).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <a
            href={project.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir en nueva pestaña
          </a>
        </div>
      </div>

      {/* Project iframe */}
      <div className="flex-1">
        <iframe
          src={project.previewUrl}
          className="w-full h-full border-0"
          style={{ minHeight: "calc(100vh - 60px)" }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title={project.title}
          loading="lazy"
        />
      </div>
    </div>
  );
}
