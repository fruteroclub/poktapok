'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useOpenBounties,
  getDifficultyDisplayName,
  getDifficultyColor,
  formatReward,
  type BountyDifficulty,
} from '@/hooks/use-bounties';
import PageWrapper from '@/components/layout/page-wrapper';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Clock, DollarSign, Zap, ArrowRight } from 'lucide-react';

export default function BountiesPage() {
  const [difficultyFilter, setDifficultyFilter] = useState<BountyDifficulty | 'all'>('all');

  const { bounties, isLoading } = useOpenBounties(
    difficultyFilter !== 'all' ? { difficulty: difficultyFilter } : {}
  );

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content space-y-6">
          {/* Header */}
          <Section>
            <div className="w-full">
              <h1 className="text-3xl font-bold tracking-tight">Bounties</h1>
              <p className="mt-2 text-muted-foreground">
                Completa bounties y gana recompensas. De cero a chamba en 3 meses.
              </p>
            </div>
          </Section>

          {/* Filters */}
          <Section>
            <div className="flex w-full flex-wrap items-center gap-4">
              <Select
                value={difficultyFilter}
                onValueChange={(v) => setDifficultyFilter(v as BountyDifficulty | 'all')}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las dificultades</SelectItem>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground">
                {bounties.length} bounties disponibles
              </div>
            </div>
          </Section>

          {/* Bounties Grid */}
          <Section>
            {isLoading ? (
              <div className="flex w-full items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : bounties.length === 0 ? (
              <Card className="w-full">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No hay bounties disponibles en este momento.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bounties.map((bounty) => (
                  <Card key={bounty._id} className="flex flex-col transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-lg">
                          {bounty.title}
                        </CardTitle>
                        <Badge className={getDifficultyColor(bounty.difficulty)}>
                          {getDifficultyDisplayName(bounty.difficulty)}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {bounty.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      {/* Tech Stack */}
                      {bounty.techStack.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {bounty.techStack.slice(0, 4).map((tech, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {bounty.techStack.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{bounty.techStack.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>Recompensa</span>
                          </div>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatReward(bounty.rewardAmount, bounty.rewardCurrency)}
                          </span>
                        </div>

                        {bounty.deadlineDays && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Tiempo</span>
                            </div>
                            <span>{bounty.deadlineDays} días</span>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <Button className="mt-4 w-full" asChild>
                        <Link href={`/bounties/${bounty._id}`}>
                          Ver Detalles
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </PageWrapper>
  );
}
