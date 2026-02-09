import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Column<T> {
  key: keyof T | string
  header: string
  className?: string
  render?: (value: unknown, row: T) => React.ReactNode
}

interface DeckTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  className?: string
}

export function DeckTable<T extends Record<string, unknown>>({
  columns,
  data,
  className,
}: DeckTableProps<T>) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-border/50',
        'print:border-gray-300',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/10 hover:bg-primary/10 print:bg-gray-100">
            {columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className={cn(
                  'font-semibold text-foreground',
                  'print:text-black',
                  col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow
              key={i}
              className={cn(
                i % 2 === 1 && 'bg-primary/5',
                'print:even:bg-gray-50',
              )}
            >
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  className={cn('print:text-sm', col.className)}
                >
                  {col.render
                    ? col.render(row[col.key as keyof T], row)
                    : String(row[col.key as keyof T] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
