import { JSX, SVGProps } from "react"
import { Card, CardHeader } from "@/components/ui/card"

interface StatCardProps {
  icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => JSX.Element
  number: string
  description: string
  color?: 'orange' | 'green' | 'pink' | 'dark'
}

export default function StatCard({ icon, number, description }: StatCardProps) {

  return (
    <Card className={`w-full rounded-2xl border-2 px-2 py-6 text-center`}>
      <CardHeader className="px-4">
        <div className="bg-background p-2 w-10 h-10 rounded-full ring-2 ring-muted">{icon({ className: 'w-6 h-6' })}</div>
      </CardHeader>
      <div className={`font-funnel text-4xl text-primary md:text-5xl lg:text-6xl font-bold`}>
        {number}
      </div>
      <p className="text-foreground font-medium">
        {description}
      </p>
    </Card>
  )
} 