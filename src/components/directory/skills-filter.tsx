"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSkills } from "@/hooks/use-skills";
import type { Skill } from "@/types/api-v1";

interface SkillsFilterProps {
  selectedSkillIds: string[];
  onSelectionChange: (skillIds: string[]) => void;
}

export function SkillsFilter({
  selectedSkillIds,
  onSelectionChange,
}: SkillsFilterProps) {
  const [open, setOpen] = React.useState(false);
  const { data: skillsData, isLoading } = useSkills();

  const skills = skillsData?.skills || [];
  const selectedSkills = skills.filter((skill) =>
    selectedSkillIds.includes(skill.id)
  );

  const handleSelect = (skill: Skill) => {
    const isSelected = selectedSkillIds.includes(skill.id);
    if (isSelected) {
      onSelectionChange(selectedSkillIds.filter((id) => id !== skill.id));
    } else {
      onSelectionChange([...selectedSkillIds, skill.id]);
    }
  };

  const handleRemove = (skillId: string) => {
    onSelectionChange(selectedSkillIds.filter((id) => id !== skillId));
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedSkills.length > 0
              ? `${selectedSkills.length} selected`
              : "Select skills..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search skills..." />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading skills..." : "No skills found."}
              </CommandEmpty>
              <CommandGroup>
                {skills.map((skill) => {
                  const isSelected = selectedSkillIds.includes(skill.id);
                  return (
                    <CommandItem
                      key={skill.id}
                      value={skill.name}
                      onSelect={() => handleSelect(skill)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{skill.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {skill.category}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Selected:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-auto px-2 py-1 text-xs"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSkills.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                <span>{skill.name}</span>
                <button
                  onClick={() => handleRemove(skill.id)}
                  className="ml-1 rounded-full hover:bg-gray-300"
                  aria-label={`Remove ${skill.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
