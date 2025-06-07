import { cn } from '@/lib/utils'
import React from 'react'

type SpinnerProps = {
  borderSize?: string
  color?: string
  size?: string
}

export default function Spinner({ size = '8', color = 'primary', borderSize = '4' }: SpinnerProps) {

  return (
    <div
      className={
        cn(
          `inline-block h-${size} w-${size} animate-spin rounded-full border border-${borderSize} border-solid border-current border-e-transparent align-[-0.125em] text-${color} motion-reduce:animate-[spin_1.5s_linear_infinite]`,
          borderSize === '6' && '!border-[4px]'
        )}
      role="status"
    >
      <span className="sr-only">
        Cargando...
      </span>
    </div>
  )
}
