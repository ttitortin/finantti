'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type DonutSlice = {
  id: string
  label: string
  amount: number
  color: string
}

const RADIUS = 40
const STROKE = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 1.2

export function DonutChart({
  slices,
  activeId,
  onHover,
  onSelect,
  children,
  className,
}: {
  slices: DonutSlice[]
  activeId?: string | null
  onHover?: (id: string | null) => void
  onSelect?: (id: string) => void
  children?: React.ReactNode
  className?: string
}) {
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const total = slices.reduce((acc, s) => acc + s.amount, 0)
  const visible = slices.filter((s) => s.amount > 0)
  const gap = visible.length > 1 ? GAP : 0
  let cumulative = 0

  return (
    <div className={cn('relative aspect-square w-full', className)}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth={STROKE} />
        {total > 0 &&
          visible.map((slice) => {
            const fraction = slice.amount / total
            const length = Math.max(fraction * CIRCUMFERENCE - gap, 0.4)
            const offset = -cumulative * CIRCUMFERENCE
            cumulative += fraction
            const dimmed = activeId != null && activeId !== slice.id
            return (
              <circle
                key={slice.id}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={activeId === slice.id ? STROKE + 3 : STROKE}
                strokeDasharray={drawn ? `${length} ${CIRCUMFERENCE}` : `0 ${CIRCUMFERENCE}`}
                strokeDashoffset={drawn ? offset : 0}
                className={cn(
                  'transition-[stroke-dasharray,stroke-dashoffset,stroke-width,opacity] duration-700 ease-out motion-reduce:transition-none',
                  onSelect && 'cursor-pointer',
                  dimmed && 'opacity-35',
                )}
                onMouseEnter={() => onHover?.(slice.id)}
                onMouseLeave={() => onHover?.(null)}
                onClick={() => onSelect?.(slice.id)}
              />
            )
          })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}
