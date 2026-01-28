import { JSX, SVGProps } from 'react'
import { Card, CardHeader } from '@/components/ui/card'

interface StatCardProps {
  icon: (
    props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>,
  ) => JSX.Element
  number: string
  description: string
  color?: 'orange' | 'green' | 'pink' | 'dark'
}

export default function StatCard({ icon, number, description }: StatCardProps) {
  return (
    <Card className={`w-full rounded-2xl border-2 px-2 py-6 text-center`}>
      <CardHeader className="px-4">
        <div className="h-10 w-10 rounded-full bg-background p-2 ring-2 ring-muted">
          {icon({ className: 'w-6 h-6' })}
        </div>
      </CardHeader>
      <div
        className={`font-funnel text-4xl font-bold text-primary md:text-5xl lg:text-6xl`}
      >
        {number}
      </div>
      <p className="font-medium text-foreground">{description}</p>
    </Card>
  )
}
