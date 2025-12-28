"use client";

import { useState, useMemo } from "react";
import { ProjectCard } from "@/components/portfolio/project-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder, SlidersHorizontal, X } from "lucide-react";
import { useUserProjects } from "@/hooks/use-projects";
import { SkillsFilter } from "@/components/directory/skills-filter";
import type { ProjectWithSkills } from "@/types/api-v1";

interface PortfolioProjectsSectionProps {
  userId: string;
  isOwner: boolean;
}

// Project type options for filtering
const PROJECT_TYPES = [
  { value: "hackathon", label: "Hackathon" },
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
  { value: "open-source", label: "Open Source" },
  { value: "research", label: "Research" },
  { value: "other", label: "Other" },
];

// Project status options for filtering
const PROJECT_STATUSES = [
  { value: "wip", label: "Work in Progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export function PortfolioProjectsSection({
  userId,
  isOwner,
}: PortfolioProjectsSectionProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(6);

  // Fetch user's projects (all if owner, published only if visitor)
  const { data, isLoading, isError } = useUserProjects(userId);

  const projects = data?.projects || [];

  // Filter projects based on selected filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Non-owners can only see published projects
      if (!isOwner && !project.publishedAt) {
        return false;
      }

      // Filter by skills
      if (selectedSkills.length > 0) {
        const projectSkillIds = project.skills.map((s) => s.id);
        const hasMatchingSkill = selectedSkills.some((skillId) =>
          projectSkillIds.includes(skillId)
        );
        if (!hasMatchingSkill) return false;
      }

      // Filter by type
      if (selectedType !== "all" && project.projectType !== selectedType) {
        return false;
      }

      // Filter by status
      if (selectedStatus !== "all" && project.projectStatus !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [projects, isOwner, selectedSkills, selectedType, selectedStatus]);

  // Sort: Featured first, then by most recent
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      // Featured projects first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      // Then by publishedAt (or createdAt if not published)
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [filteredProjects]);

  // Paginate projects
  const displayedProjects = sortedProjects.slice(0, displayCount);
  const hasMore = sortedProjects.length > displayCount;

  const handleClearFilters = () => {
    setSelectedSkills([]);
    setSelectedType("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters =
    selectedSkills.length > 0 ||
    selectedType !== "all" ||
    selectedStatus !== "all";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading projects...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Failed to load projects</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Projects (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {isOwner
                ? "No projects yet. Create your first project to showcase your work!"
                : "No projects to display"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Projects ({sortedProjects.length})
              </CardTitle>
              {filteredProjects.length < projects.length && (
                <CardDescription className="mt-1">
                  Showing {filteredProjects.length} of {projects.length}{" "}
                  projects
                </CardDescription>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {[
                    selectedSkills.length > 0 ? 1 : 0,
                    selectedType !== "all" ? 1 : 0,
                    selectedStatus !== "all" ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-6 pb-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Skills Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Skills</Label>
                <SkillsFilter
                  selectedSkillIds={selectedSkills}
                  onSelectionChange={setSelectedSkills}
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Project Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        <CardContent className="pt-6">
          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No projects match your filters
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => setDisplayCount((prev) => prev + 6)}
                    variant="outline"
                  >
                    Load More Projects
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
