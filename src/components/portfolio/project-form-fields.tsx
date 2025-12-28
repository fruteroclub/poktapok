/**
 * ProjectFormFields Component
 *
 * Reusable form fields for project creation and editing
 * Integrates with React Hook Form for validation
 */

'use client';

import { Control, FieldErrors } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectTypeSelector } from './project-type-selector';
import { SkillSelector } from './skill-selector';
import { LogoUpload } from './logo-upload';
import { ImagesUpload } from './images-upload';
import type { Skill } from '@/types/api-v1';
import type { CreateProjectInput } from '@/lib/validators/project';

interface ProjectFormFieldsProps {
  control: Control<CreateProjectInput>;
  errors: FieldErrors<CreateProjectInput>;
  selectedSkills: Skill[];
  onSkillsChange: (skills: Skill[]) => void;
  projectId?: string | null; // For edit mode (existing projects)
  currentLogoUrl?: string | null; // For edit mode (existing logo)
  currentImageUrls?: string[]; // For edit mode (existing images)
  onLogoUploadComplete?: (logoUrl: string) => void;
  onLogoDelete?: () => void;
  onImagesUploadComplete?: (imageUrls: string[]) => void;
  onImageDelete?: (imageUrl: string) => void;
  onImagesReorder?: (imageUrls: string[]) => void;
  disabled?: boolean;
}

export function ProjectFormFields({
  control,
  errors,
  selectedSkills,
  onSkillsChange,
  projectId,
  currentLogoUrl,
  currentImageUrls = [],
  onLogoUploadComplete,
  onLogoDelete,
  onImagesUploadComplete,
  onImageDelete,
  onImagesReorder,
  disabled = false,
}: ProjectFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Title *</FormLabel>
            <FormControl>
              <Input
                placeholder="My Amazing Project"
                {...field}
                maxLength={100}
              />
            </FormControl>
            <FormDescription>
              {field.value?.length || 0} / 100 characters (min 5)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description of your project (20-280 characters)"
                className="resize-none min-h-[100px]"
                {...field}
                maxLength={280}
              />
            </FormControl>
            <FormDescription>
              {field.value?.length || 0} / 280 characters (min 20)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Project Type */}
      <FormField
        control={control}
        name="projectType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Type *</FormLabel>
            <FormControl>
              <ProjectTypeSelector
                value={field.value}
                onChange={field.onChange}
                error={errors.projectType?.message?.toString()}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Project Status */}
      <FormField
        control={control}
        name="projectStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="wip">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Draft projects are only visible to you
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Repository URL */}
      <FormField
        control={control}
        name="repositoryUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Repository URL</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://github.com/username/repo"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Link to your GitHub, GitLab, or other code repository
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Live URL */}
      <FormField
        control={control}
        name="liveUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Live Demo URL</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://myproject.com"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Link to the deployed application or website
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Video URL */}
      <FormField
        control={control}
        name="videoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video URL</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormDescription>
              Link to a demo video or presentation (YouTube, Loom, etc.)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* URL Requirement Note */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm text-orange-800">
          <strong>Note:</strong> At least one URL (repository, live demo, or video) is required to verify your project.
        </p>
      </div>

      {/* Project Logo */}
      <FormField
        control={control}
        name="logoUrl"
        render={({ field }) => (
          <FormItem>
            <LogoUpload
              projectId={projectId ?? null}
              currentLogoUrl={currentLogoUrl || field.value}
              onUploadComplete={(logoUrl) => {
                field.onChange(logoUrl);
                onLogoUploadComplete?.(logoUrl);
              }}
              onDelete={() => {
                field.onChange(null);
                onLogoDelete?.();
              }}
              disabled={disabled}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Project Images */}
      <FormField
        control={control}
        name="imageUrls"
        render={({ field }) => (
          <FormItem>
            <ImagesUpload
              projectId={projectId ?? null}
              currentImageUrls={currentImageUrls.length > 0 ? currentImageUrls : field.value}
              onUploadComplete={(imageUrls) => {
                field.onChange(imageUrls);
                onImagesUploadComplete?.(imageUrls);
              }}
              onDelete={(imageUrl) => {
                const updated = (field.value || []).filter((url) => url !== imageUrl);
                field.onChange(updated);
                onImageDelete?.(imageUrl);
              }}
              onReorder={(imageUrls) => {
                field.onChange(imageUrls);
                onImagesReorder?.(imageUrls);
              }}
              disabled={disabled}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Skills */}
      <FormField
        control={control}
        name="skillIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Skills *</FormLabel>
            <FormControl>
              <SkillSelector
                selectedSkills={selectedSkills}
                onSkillsChange={(skills) => {
                  onSkillsChange(skills);
                  field.onChange(skills.map((s) => s.id));
                }}
                maxSkills={10}
                required
                error={errors.skillIds?.message?.toString()}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
