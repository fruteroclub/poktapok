"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function StudioPreviewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.studio.getProjectBySlug, { slug });

  if (project === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8F0]">
        <div className="animate-pulse text-gray-500">Cargando proyecto...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF8F0] p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-600 text-center">
          Este proyecto no existe o ha sido eliminado.
        </p>
        <a
          href="/"
          className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-orange-500 font-bold">🍊 Frutero Studio</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-700 font-medium">{project.title}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>v{project.version}</span>
          <span className="text-gray-300">•</span>
          <span>
            Actualizado {new Date(project.updatedAt).toLocaleDateString("es-MX")}
          </span>
        </div>
      </div>

      {/* Project iframe */}
      <iframe
        srcDoc={project.code}
        className="w-full border-0"
        style={{ height: "calc(100vh - 48px)" }}
        sandbox="allow-scripts allow-modals allow-forms"
        title={project.title}
      />
    </div>
  );
}
