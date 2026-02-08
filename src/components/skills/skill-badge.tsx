'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getLevelColor, getLevelDisplayName, type SkillLevel } from '@/hooks/use-skills';
import { ThumbsUp } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  level: SkillLevel;
  endorsementCount?: number;
  showLevel?: boolean;
  onClick?: () => void;
}

export function SkillBadge({
  name,
  level,
  endorsementCount = 0,
  showLevel = true,
  onClick,
}: SkillBadgeProps) {
  const levelColor = getLevelColor(level);
  const levelName = getLevelDisplayName(level);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${levelColor} cursor-default transition-colors ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onClick}
          >
            <span>{name}</span>
            {endorsementCount > 0 && (
              <span className="ml-1.5 flex items-center gap-0.5 text-xs opacity-70">
                <ThumbsUp className="h-3 w-3" />
                {endorsementCount}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {name} - {levelName}
          </p>
          {endorsementCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {endorsementCount} {endorsementCount === 1 ? 'endorsement' : 'endorsements'}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
