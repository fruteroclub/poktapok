/**
 * SkillSelector Component
 *
 * Multi-select skill picker with search and category filtering
 * Used in project forms to select skills
 */

'use client';

import { useState, useMemo } from 'react';
import { Check, X, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SkillBadge } from './skill-badge';
import { useSkills } from '@/hooks/use-skills';
import type { Skill } from '@/types/api-v1';

interface SkillSelectorProps {
  selectedSkills: Skill[];
  onSkillsChange: (skills: Skill[]) => void;
  maxSkills?: number;
  required?: boolean;
  error?: string;
}

export function SkillSelector({
  selectedSkills,
  onSkillsChange,
  maxSkills = 10,
  required = false,
  error,
}: SkillSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Fetch all skills
  const { data: skillsData, isLoading } = useSkills();
  const allSkills = skillsData?.skills || [];

  // Filter skills based on search and category
  const filteredSkills = useMemo(() => {
    return allSkills.filter((skill) => {
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || skill.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allSkills, searchQuery, categoryFilter]);

  // Check if skill is selected
  const isSelected = (skillId: string) => {
    return selectedSkills.some((s) => s.id === skillId);
  };

  // Toggle skill selection
  const toggleSkill = (skill: Skill) => {
    if (isSelected(skill.id)) {
      onSkillsChange(selectedSkills.filter((s) => s.id !== skill.id));
    } else {
      if (selectedSkills.length < maxSkills) {
        onSkillsChange([...selectedSkills, skill]);
      }
    }
  };

  // Remove skill from selection
  const removeSkill = (skillId: string) => {
    onSkillsChange(selectedSkills.filter((s) => s.id !== skillId));
  };

  // Categories for filtering
  const categories = [
    { value: 'language', label: 'Languages' },
    { value: 'framework', label: 'Frameworks' },
    { value: 'tool', label: 'Tools' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-2">
      {/* Selected skills display */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 border rounded-lg bg-muted/50">
          {selectedSkills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-1 group">
              <SkillBadge skill={skill} size="sm" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeSkill(skill.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Skill selector popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            type="button"
          >
            {selectedSkills.length === 0 ? (
              <span className="text-muted-foreground">
                Select skills{required && ' *'}
              </span>
            ) : (
              <span>
                {selectedSkills.length} / {maxSkills} skills selected
              </span>
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search skills..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <div className="flex items-center gap-1 px-3 py-2 border-b">
              <Button
                variant={categoryFilter === null ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCategoryFilter(null)}
                type="button"
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={categoryFilter === cat.value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat.value)}
                  type="button"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Loading skills...' : 'No skills found.'}
              </CommandEmpty>
              <CommandGroup>
                {filteredSkills.map((skill) => {
                  const selected = isSelected(skill.id);
                  const disabled = !selected && selectedSkills.length >= maxSkills;

                  return (
                    <CommandItem
                      key={skill.id}
                      value={skill.name}
                      onSelect={() => !disabled && toggleSkill(skill)}
                      disabled={disabled}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                            selected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-input'
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" />}
                        </div>
                        <span>{skill.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {skill.category}
                      </Badge>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Helper text */}
      <p className="text-sm text-muted-foreground">
        Select {required ? 'at least 1' : 'up to'} {maxSkills} skill{maxSkills > 1 ? 's' : ''} used in this project
      </p>
    </div>
  );
}
