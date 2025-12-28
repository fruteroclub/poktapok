/**
 * ProjectTypeSelector Component
 *
 * Radio group for selecting project type
 * Visual card-based selection with icons
 */

'use client';

import { Briefcase, Code, Trophy, Building, DollarSign, Target } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';

interface ProjectTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const projectTypes = [
  {
    value: 'personal',
    label: 'Personal',
    description: 'Side projects and experiments',
    icon: Code,
  },
  {
    value: 'bootcamp',
    label: 'Bootcamp',
    description: 'Learning program projects',
    icon: Target,
  },
  {
    value: 'hackathon',
    label: 'Hackathon',
    description: 'Competition submissions',
    icon: Trophy,
  },
  {
    value: 'work-related',
    label: 'Work',
    description: 'Professional work',
    icon: Building,
  },
  {
    value: 'freelance',
    label: 'Freelance',
    description: 'Client projects',
    icon: Briefcase,
  },
  {
    value: 'bounty',
    label: 'Bounty',
    description: 'Bounty submissions',
    icon: DollarSign,
  },
];

export function ProjectTypeSelector({ value, onChange, error }: ProjectTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {projectTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.value;

          return (
            <Label
              key={type.value}
              htmlFor={type.value}
              className="cursor-pointer"
            >
              <Card
                className={`relative p-4 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem
                  value={type.value}
                  id={type.value}
                  className="sr-only"
                />
                <div className="flex flex-col items-center text-center gap-2">
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <div className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {type.description}
                    </div>
                  </div>
                </div>
              </Card>
            </Label>
          );
        })}
      </RadioGroup>

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
