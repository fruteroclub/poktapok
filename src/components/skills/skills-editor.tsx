'use client';

import { useState } from 'react';
import { useSkills, useUserSkills, useSkillMutations, type SkillCategory, type SkillLevel, getCategoryDisplayName, getLevelDisplayName, getLevelColor } from '@/hooks/use-skills';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Id } from '../../../convex/_generated/dataModel';
import { Plus, X, Loader2, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

interface SkillsEditorProps {
  userId: Id<'users'>;
}

export function SkillsEditor({ userId }: SkillsEditorProps) {
  const { skills, isLoading: loadingSkills } = useSkills();
  const { userSkills, isLoading: loadingUserSkills } = useUserSkills(userId);
  const { addUserSkill, removeUserSkill, updateUserSkillLevel } = useSkillMutations();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [selectedSkillId, setSelectedSkillId] = useState<Id<'skills'> | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('beginner');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<Id<'userSkills'> | null>(null);

  const isLoading = loadingSkills || loadingUserSkills;

  // Get IDs of skills user already has
  const userSkillIds = new Set(userSkills.map((us) => us.skillId.toString()));

  // Filter available skills (not already added)
  const availableSkills = skills.filter(
    (s) =>
      !userSkillIds.has(s._id.toString()) &&
      (selectedCategory === 'all' || s.category === selectedCategory)
  );

  const categories: SkillCategory[] = [
    'frontend',
    'backend',
    'blockchain',
    'ai',
    'devops',
    'design',
    'other',
  ];

  const levels: SkillLevel[] = ['beginner', 'intermediate', 'advanced'];

  const handleAddSkill = async () => {
    if (!selectedSkillId) {
      toast.error('Selecciona un skill');
      return;
    }

    setIsAdding(true);
    try {
      await addUserSkill({
        userId,
        skillId: selectedSkillId as Id<'skills'>,
        level: selectedLevel,
      });
      toast.success('Skill agregado');
      setSelectedSkillId('');
      setSelectedLevel('beginner');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error agregando skill');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSkill = async (userSkillId: Id<'userSkills'>) => {
    setRemovingId(userSkillId);
    try {
      await removeUserSkill({ userSkillId });
      toast.success('Skill eliminado');
    } catch (error: any) {
      toast.error(error.message || 'Error eliminando skill');
    } finally {
      setRemovingId(null);
    }
  };

  const handleUpdateLevel = async (userSkillId: Id<'userSkills'>, level: SkillLevel) => {
    try {
      await updateUserSkillLevel({ userSkillId, level });
      toast.success('Nivel actualizado');
    } catch (error: any) {
      toast.error(error.message || 'Error actualizando nivel');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group user skills by category
  const groupedSkills = userSkills.reduce(
    (acc, us) => {
      const category = us.skill?.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(us);
      return acc;
    },
    {} as Record<string, typeof userSkills>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mis Skills</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Agregar Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Skill</DialogTitle>
              <DialogDescription>
                Selecciona un skill y tu nivel de experiencia
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <Select
                  value={selectedCategory}
                  onValueChange={(v) => {
                    setSelectedCategory(v as SkillCategory | 'all');
                    setSelectedSkillId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {getCategoryDisplayName(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skill Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Skill</label>
                <Select
                  value={selectedSkillId}
                  onValueChange={(v) => setSelectedSkillId(v as Id<'skills'>)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkills.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No hay más skills disponibles en esta categoría
                      </div>
                    ) : (
                      availableSkills.map((skill) => (
                        <SelectItem key={skill._id} value={skill._id}>
                          {skill.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Level Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nivel</label>
                <Select
                  value={selectedLevel}
                  onValueChange={(v) => setSelectedLevel(v as SkillLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {getLevelDisplayName(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleAddSkill}
                disabled={!selectedSkillId || isAdding}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  'Agregar'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {userSkills.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No has agregado ningún skill aún. ¡Agrega tus habilidades para que otros puedan
            encontrarte!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const skills = groupedSkills[category];
            if (!skills || skills.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {getCategoryDisplayName(category)}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((us) => (
                    <div
                      key={us._id}
                      className="group flex items-center gap-1 rounded-lg border bg-card p-2"
                    >
                      <Badge variant="outline" className={getLevelColor(us.level)}>
                        {us.skill?.name}
                      </Badge>
                      
                      {/* Level selector */}
                      <Select
                        value={us.level}
                        onValueChange={(v) => handleUpdateLevel(us._id, v as SkillLevel)}
                      >
                        <SelectTrigger className="h-6 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level} value={level} className="text-xs">
                              {getLevelDisplayName(level)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Endorsement count */}
                      {us.endorsementCount > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          {us.endorsementCount}
                        </span>
                      )}

                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleRemoveSkill(us._id)}
                        disabled={removingId === us._id}
                      >
                        {removingId === us._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
