/**
 * ProjectSkills Component
 *
 * Displays project skills grouped by category with color coding
 * Used in the individual project view page
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Skill } from '@/types/api-v1';

interface ProjectSkillsProps {
  skills: Skill[];
}

// Category colors matching the design system
const categoryColors: Record<string, string> = {
  language: 'bg-blue-100 text-blue-800 border-blue-200',
  framework: 'bg-green-100 text-green-800 border-green-200',
  tool: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blockchain: 'bg-purple-100 text-purple-800 border-purple-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function ProjectSkills({ skills }: ProjectSkillsProps) {
  if (skills.length === 0) {
    return null;
  }

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      const category = skill.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  // Sort categories
  const sortedCategories = Object.keys(skillsByCategory).sort((a, b) => {
    const order = ['language', 'framework', 'tool', 'blockchain', 'other'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          🏷️ Technologies Used
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCategories.map((category) => {
            const categorySkills = skillsByCategory[category];
            const colorClass = categoryColors[category] || categoryColors.other;

            return (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground capitalize">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className={`${colorClass} font-medium`}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
