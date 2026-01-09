'use client'

import { Program } from '@/types/api-v1'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ProgramsTableProps {
  programs: Program[]
  isLoading: boolean
  onEdit: (programId: string) => void
  onDelete: (programId: string) => void
}

export function ProgramsTable({ programs, isLoading, onEdit, onDelete }: ProgramsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (programs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No programs found. Create your first program to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <div className="font-medium">{program.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={program.programType === 'cohort' ? 'default' : 'secondary'}>
                      {program.programType === 'cohort' ? 'Cohort' : 'Evergreen'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {program.programType === 'cohort' && program.startDate && program.endDate ? (
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Start: </span>
                          {new Date(program.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">End: </span>
                          {new Date(program.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Ongoing</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={program.isActive ? 'default' : 'secondary'}>
                      {program.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(program.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(program.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit program</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(program.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete program</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
