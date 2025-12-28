/**
 * EditProjectForm Component
 *
 * Project editing form with pre-population
 * Handles form submission and error states
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectFormFields } from './project-form-fields';
import { useUpdateProject, useDeleteProject } from '@/hooks/use-projects';
import { updateProjectSchema, type UpdateProjectInput } from '@/lib/validators/project';
import type { ProjectWithSkills, Skill } from '@/types/api-v1';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EditProjectFormProps {
  project: ProjectWithSkills;
}

export function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(project.skills || []);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize form with project data
  const form = useForm<UpdateProjectInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateProjectSchema) as any,
    defaultValues: {
      title: project.title,
      description: project.description,
      projectType: project.projectType,
      projectStatus: project.projectStatus,
      repositoryUrl: project.repositoryUrl,
      liveUrl: project.liveUrl,
      videoUrl: project.videoUrl,
      logoUrl: project.logoUrl,
      imageUrls: project.imageUrls || [],
      skillIds: project.skills.map((s) => s.id),
    },
  });

  // Update project mutation
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  // Handle skill changes
  const handleSkillsChange = (skills: Skill[]) => {
    setSelectedSkills(skills);
    form.setValue('skillIds', skills.map((s) => s.id));
  };

  // Form submission handler
  const onSubmit = async (data: UpdateProjectInput) => {
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data,
      });

      toast.success('Project updated successfully!');
      router.push('/portfolio');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to update project');
      }
    }
  };

  // Delete handler
  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      toast.success('Project deleted successfully');
      router.push('/portfolio');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to delete project');
      }
    }
  };

  const isSubmitting = form.formState.isSubmitting || updateProjectMutation.isPending;
  const isDeleting = deleteProjectMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Project</CardTitle>
        <CardDescription>
          Update your project details. Changes will be reflected immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProjectFormFields
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              errors={form.formState.errors as any}
              selectedSkills={selectedSkills}
              onSkillsChange={handleSkillsChange}
              projectId={project.id} // Existing project ID for immediate upload
              currentLogoUrl={project.logoUrl}
              currentImageUrls={project.imageUrls || []}
              onLogoUploadComplete={(logoUrl) => {
                form.setValue('logoUrl', logoUrl);
              }}
              onLogoDelete={() => {
                form.setValue('logoUrl', null);
              }}
              onImagesUploadComplete={(imageUrls) => {
                form.setValue('imageUrls', imageUrls);
              }}
              onImageDelete={(imageUrl) => {
                const current = form.getValues('imageUrls') || [];
                form.setValue('imageUrls', current.filter((url) => url !== imageUrl));
              }}
              onImagesReorder={(imageUrls) => {
                form.setValue('imageUrls', imageUrls);
              }}
              disabled={isSubmitting || isDeleting}
            />

            {/* Form actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              {/* Delete button (only for draft projects) */}
              {project.projectStatus === 'draft' && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isSubmitting || isDeleting}
                    >
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete Draft
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this project? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Save/Cancel buttons */}
              <div className="flex items-center gap-3 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting || isDeleting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isDeleting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
