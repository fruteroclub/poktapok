/**
 * CreateProjectForm Component
 *
 * Full project creation form with validation
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
import { Card, CardContent } from '@/components/ui/card';
import { ProjectFormFields } from './project-form-fields';
import { useCreateProject } from '@/hooks/use-projects';
import { createProjectSchema, type CreateProjectInput } from '@/lib/validators/project';
import type { Skill } from '@/types/api-v1';

export function CreateProjectForm({ className }: { className?: string }) {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);

  // Initialize form with default values
  const form = useForm<CreateProjectInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createProjectSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      projectType: 'personal',
      projectStatus: 'draft',
      repositoryUrl: null,
      liveUrl: null,
      videoUrl: null,
      logoUrl: null,
      imageUrls: [],
      skillIds: [],
    },
  });

  // Create project mutation
  const createProjectMutation = useCreateProject();

  // Handle skill changes
  const handleSkillsChange = (skills: Skill[]) => {
    setSelectedSkills(skills);
    form.setValue('skillIds', skills.map((s) => s.id));
  };

  // Form submission handler
  const onSubmit = async (data: CreateProjectInput) => {
    try {
      // Step 1: Create project without logo/images first
      toast.info('Creating project...');
      const projectData = {
        ...data,
        logoUrl: null, // Don't send blob URLs
        imageUrls: [], // Don't send blob URLs
      };

      const response = await createProjectMutation.mutateAsync(projectData);
      const projectId = response.project.id;

      // Step 2: Upload logo if selected
      if (pendingLogoFile) {
        try {
          toast.info('Uploading logo...');
          const formData = new FormData();
          formData.append('logo', pendingLogoFile);

          const uploadResponse = await fetch(`/api/projects/${projectId}/logo`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            toast.warning('Logo upload failed, but project was created');
          }
        } catch (uploadError) {
          console.error('Logo upload error:', uploadError);
          toast.warning('Logo upload failed, but project was created');
        }
      }

      // Step 3: Upload images if selected
      if (pendingImageFiles.length > 0) {
        try {
          toast.info(`Uploading ${pendingImageFiles.length} image(s)...`);
          const formData = new FormData();
          pendingImageFiles.forEach((file) => {
            formData.append('images', file);
          });

          const uploadResponse = await fetch(`/api/projects/${projectId}/images`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            toast.warning('Some images failed to upload, but project was created');
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.warning('Some images failed to upload, but project was created');
        }
      }

      toast.success('Project created successfully!');

      // Redirect based on status
      if (response.project.projectStatus === 'draft') {
        router.push('/portfolio');
      } else {
        router.push(`/portfolio/${response.project.id}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to create project');
      }
    }
  };

  const isSubmitting = form.formState.isSubmitting || createProjectMutation.isPending;

  return (
    <Card className={className}>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProjectFormFields
              control={form.control}
              errors={form.formState.errors}
              selectedSkills={selectedSkills}
              onSkillsChange={handleSkillsChange}
              projectId={null} // New projects don't have an ID yet
              currentLogoUrl={null}
              currentImageUrls={[]}
              onLogoFileSelected={(file) => {
                setPendingLogoFile(file);
              }}
              onImageFilesSelected={(files) => {
                setPendingImageFiles(files);
              }}
              disabled={isSubmitting}
            />

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
