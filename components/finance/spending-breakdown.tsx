'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight, ListFilter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GROUPS, GROUP_ORDER } from '@/lib/finance/data'
import { formatMoney, formatPercent } from '@/lib/finance/format'
import type { CategoryTotal, MonthSummary } from '@/lib/finance/selectors'
import type { GroupId } from '@/lib/finance/types'
import { cn } from '@/lib/utils'
import { DonutChart, type DonutSlice } from './donut-chart'
import { CategoryIcon, GROUP_ICONS, GROUP_STYLES } from './icons'

const MAX_SLICES = 7
const OTHER_ID = '__other'

function shade(group: GroupId, index: number, count: number) {
  const hue = GROUPS[group].hue
  const t = count <= 1 ? 0 : index / (count - 1)
  const lightness = 0.42 + t * 0.4
  const chroma = 0.14 - t * 0.07
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue})`
}

function buildChildSlices(group: GroupId, categories: CategoryTotal[]) {
  const overflow = categories.length > MAX_SLICES
  const shown = overflow ? categories.slice(0, MAX_SLICES - 1) : categories
  const rest = overflow ? categories.slice(MAX_SLICES - 1) : []
  const slices: DonutSlice[] = shown.map((c, i) => ({
    id: c.categoryId,
    label: c.name,
    amount: c.amount,
    color: shade(group, i, shown.length),
  }))
  if (rest.length > 0) {
    slices.push({
      id: OTHER_ID,
      label: `${rest.length} more categories`,
      amount: rest.reduce((acc, c) => acc + c.amount, 0),
      color: 'oklch(0.78 0.01 255)',
    })
  }
  return { slices, rest }
}

export function SpendingBreakdown({
  summary,
  monthLabel,
  onViewTransactions,
  onAdd,
}: {
  summary: MonthSummary
  monthLabel: string
  onViewTransactions: (group: GroupId) => void
  onAdd: () => void
}) {
  const [selected, setSelected] = useState<GroupId | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [showRest, setShowRest] = useState(false)

  const selectGroup = (group: GroupId | null) => {
    setSelected(group)
    setHoverId(null)
    setShowRest(false)
  }

  return (
    <section aria-labelledby="breakdown-heading" className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {selected ? (
            <Button variant="ghost" size="sm" className="-ml-2 mb-1 text-muted-foreground" onClick={() => selectGroup(null)}>
              <ArrowLeft data-icon="inline-start" />
              All groups
            </Button>
          ) : null}
          <h2 id="breakdown-heading" className="text-base font-semibold text-balance">
            {selected ? `${GROUPS[selected].label} by category` : 'Where your money went'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {selected ? GROUPS[selected].description : `Needs, Wants, and Savings · ${monthLabel}`}
          </p>
        </div>
        {selected ? (
          <div role="tablist" aria-label="Switch group" className="flex rounded-lg bg-muted p-0.5">
            {GROUP_ORDER.map((g) => (
              <button
                key={g}
                role="tab"
                aria-selected={selected === g}
                onClick={() => selectGroup(g)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  selected === g ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {GROUPS[g].label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div key={selected ?? 'overview'} className="mt-5 animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none">
        {selected ? (
          <GroupDrilldown
            group={selected}
            summary={summary}
            monthLabel={monthLabel}
            hoverId={hoverId}
            setHoverId={setHoverId}
            showRest={showRest}
            setShowRest={setShowRest}
            onBack={() => selectGroup(null)}
            onViewTransactions={() => onViewTransactions(selected)}
            onAdd={onAdd}
          />
        ) : (
          <GroupOverview summary={summary} hoverId={hoverId} setHoverId={setHoverId} onSelect={selectGroup} />
        )}
      </div>
    </section>
  )
}

function GroupOverview({
  summary,
  hoverId,
  setHoverId,
  onSelect,
}: {
  summary: MonthSummary
  hoverId: string | null
  setHoverId: (id: string | null) => void
  onSelect: (g: GroupId) => void
}) {
  const total = summary.groupedTotal
  const slices: DonutSlice[] = summary.groups.map((g) => ({
    id: g.group,
    label: GROUPS[g.group].label,
    amount: g.amount,
    color: GROUP_STYLES[g.group].fill,
  }))
  const hovered = summary.groups.find((g) => g.group === hoverId)

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
      <DonutChart
        slices={slices}
        activeId={hoverId}
        onHover={setHoverId}
        onSelect={(id) => onSelect(id as GroupId)}
        className="mx-auto max-w-[220px]"
      >
        <span className="text-xs text-muted-foreground">{hovered ? GROUPS[hovered.group].label : 'Allocated'}</span>
        <span className="text-xl font-semibold tabular-nums">{formatMoney(hovered ? hovered.amount : total)}</span>
        {hovered && total > 0 ? (
          <span className="text-xs text-muted-foreground tabular-nums">{formatPercent(hovered.amount / total)}</span>
        ) : null}
      </DonutChart>

      <ul className="flex flex-col gap-2">
        {summary.groups.map((g) => {
          const Icon = GROUP_ICONS[g.group]
          const style = GROUP_STYLES[g.group]
          const pct = total > 0 ? g.amount / total : 0
          return (
            <li key={g.group}>
              <button
                type="button"
                onClick={() => onSelect(g.group)}
                onMouseEnter={() => setHoverId(g.group)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(g.group)}
                onBlur={() => setHoverId(null)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-2',
                  hoverId === g.group && 'bg-accent',
                )}
                aria-label={`${GROUPS[g.group].label}: ${formatMoney(g.amount)}, ${formatPercent(pct)} of allocated. Show categories`}
              >
                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', style.soft, style.text)}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{GROUPS[g.group].label}</span>
                    <span className="font-semibold tabular-nums">{formatMoney(g.amount)}</span>
                  </span>
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn('block h-full rounded-full transition-[width] duration-700', style.bg)}
                        style={{ width: `${pct * 100}%` }}
                      />
                    </span>
                    <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{formatPercent(pct)}</span>
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {g.count === 0 ? 'No entries yet' : `${g.count} ${g.count === 1 ? 'entry' : 'entries'} · ${g.categories.length} ${g.categories.length === 1 ? 'category' : 'categories'}`}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function GroupDrilldown({
  group,
  summary,
  monthLabel,
  hoverId,
  setHoverId,
  showRest,
  setShowRest,
  onBack,
  onViewTransactions,
  onAdd,
}: {
  group: GroupId
  summary: MonthSummary
  monthLabel: string
  hoverId: string | null
  setHoverId: (id: string | null) => void
  showRest: boolean
  setShowRest: (v: boolean) => void
  onBack: () => void
  onViewTransactions: () => void
  onAdd: () => void
}) {
  const data = summary.groups.find((g) => g.group === group)
  const style = GROUP_STYLES[group]
  const Icon = GROUP_ICONS[group]

  if (!data || data.amount === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center">
        <span className={cn('flex size-10 items-center justify-center rounded-full', style.soft, style.text)}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="font-medium">No {GROUPS[group].label} entries in {monthLabel}</p>
        <p className="max-w-xs text-sm text-muted-foreground text-pretty">
          When you record something in a {GROUPS[group].label} category, it will show up here.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft data-icon="inline-start" />
            Back to all groups
          </Button>
          <Button onClick={onAdd}>
            <Plus data-icon="inline-start" />
            Add transaction
          </Button>
        </div>
      </div>
    )
  }

  const { slices, rest } = buildChildSlices(group, data.categories)
  const hovered = slices.find((s) => s.id === hoverId)

  return (
    <div className="grid items-start gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
      <DonutChart slices={slices} activeId={hoverId} onHover={setHoverId} className="mx-auto max-w-[220px]">
        <span className={cn('text-xs font-medium', style.text)}>{hovered ? hovered.label : GROUPS[group].label}</span>
        <span className="text-xl font-semibold tabular-nums">{formatMoney(hovered ? hovered.amount : data.amount)}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {hovered ? `${formatPercent(hovered.amount / data.amount)} of group` : `${formatPercent(summary.groupedTotal ? data.amount / summary.groupedTotal : 0)} of allocated`}
        </span>
      </DonutChart>

      <div className="flex flex-col gap-3">
        <ul className="flex flex-col">
          {slices.map((slice) => {
            const isOther = slice.id === OTHER_ID
            return (
              <li key={slice.id} className="border-b last:border-b-0">
                <div
                  className={cn('flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors', hoverId === slice.id && 'bg-accent')}
                  onMouseEnter={() => setHoverId(slice.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: slice.color }} aria-hidden="true" />
                  {isOther ? (
                    <button
                      type="button"
                      onClick={() => setShowRest(!showRest)}
                      aria-expanded={showRest}
                      className="flex min-w-0 flex-1 items-center gap-1 text-left text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {showRest ? 'Hide' : 'Show'} {slice.label}
                      <ChevronDown className={cn('size-4 transition-transform', showRest && 'rotate-180')} aria-hidden="true" />
                    </button>
                  ) : (
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <CategoryIcon categoryId={slice.id} className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium" title={slice.label}>
                        {slice.label}
                      </span>
                    </span>
                  )}
                  <span className="w-11 text-right text-xs text-muted-foreground tabular-nums">
                    {formatPercent(slice.amount / data.amount)}
                  </span>
                  <span className="w-24 text-right text-sm font-semibold tabular-nums">{formatMoney(slice.amount)}</span>
                </div>
                {isOther && showRest ? (
                  <ul className="mb-2 ml-5 flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
                    {rest.map((c) => (
                      <li key={c.categoryId} className="flex items-center gap-3 px-2 py-1.5">
                        <CategoryIcon categoryId={c.categoryId} className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-sm" title={c.name}>
                          {c.name}
                        </span>
                        <span className="w-11 text-right text-xs text-muted-foreground tabular-nums">
                          {formatPercent(c.amount / data.amount)}
                        </span>
                        <span className="w-24 text-right text-sm tabular-nums">{formatMoney(c.amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
        <Button variant="outline" className="self-start" onClick={onViewTransactions}>
          <ListFilter data-icon="inline-start" />
          View {data.count} {GROUPS[group].label} {data.count === 1 ? 'entry' : 'entries'}
        </Button>
      </div>
    </div>
  )
}
