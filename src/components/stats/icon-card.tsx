import { JSX, SVGProps } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface IconCardProps {
  icon: (
    props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
  ) => JSX.Element
  className?: string
  label: string
  description?: string
  color?: 'orange' | 'green' | 'pink' | 'dark'
}

export default function IconCard({
  icon,
  className,
  label,
  description,
}: IconCardProps) {
  return (
    <Card className={cn(`rounded-2xl border-2 py-4 text-center`, className)}>
      <CardHeader className="flex w-full items-center justify-center px-4 md:flex-col">
        <div className="ring-none flex aspect-square h-full w-1/2 items-center justify-center rounded-full border-none bg-foreground p-2 md:w-3/4 lg:w-1/2 lg:bg-foreground">
          {icon({ className: 'w-3/5 h-3/5 md:w-3/4 md:h-3/4 text-primary' })}
        </div>
        <CardTitle
          className={`font-funnel text-2xl font-medium lg:text-foreground`}
        >
          {label}
        </CardTitle>
      </CardHeader>
      {description && (
        <p className="font-medium text-foreground">{description}</p>
      )}
    </Card>
  )
}
