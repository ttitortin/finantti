'use client'

import { useMemo } from 'react'
import { Plus, RotateCcw, SearchX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ACCOUNTS, GROUPS, GROUP_ORDER } from '@/lib/finance/data'
import { formatDayHeading, formatMoney } from '@/lib/finance/format'
import { accountName, allTags, applyFilters, groupByDay } from '@/lib/finance/selectors'
import type { DateRangePreset, HistoryFilters } from '@/lib/finance/types'
import { cn } from '@/lib/utils'
import { useFinance } from './finance-provider'
import { GROUP_ICONS, GROUP_STYLES } from './icons'
import { TransactionRow } from './transaction-row'

const RANGE_LABELS: Record<DateRangePreset, string> = {
  all: 'All time',
  'this-month': 'This month',
  'last-month': 'Last month',
  'last-30': 'Last 30 days',
  custom: 'Custom range',
}

const selectClass =
  'h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function HistoryView({ highlightId }: { highlightId?: string }) {
  const { status, transactions, filters, setFilters, resetFilters, openEntry, retryLoad } = useFinance()

  const filtered = useMemo(() => applyFilters(transactions, filters), [transactions, filters])
  const days = useMemo(() => groupByDay(filtered), [filtered])
  const tags = useMemo(() => allTags(transactions), [transactions])
  const chips = activeChips(filters)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Every entry behind your totals</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">History</h1>
        </div>
        {status === 'ready' ? (
          <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
            Showing {filtered.length} of {transactions.length} {transactions.length === 1 ? 'entry' : 'entries'}
          </p>
        ) : null}
      </div>

      {status === 'error' ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p>We couldn&apos;t load your entries. Your filters are kept.</p>
          <Button variant="outline" size="sm" onClick={retryLoad}>
            <RotateCcw data-icon="inline-start" />
            Try again
          </Button>
        </div>
      ) : null}

      <section aria-label="Filters" className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr]">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Account
            <select
              className={selectClass}
              value={filters.accountId ?? ''}
              onChange={(e) => setFilters({ accountId: e.target.value || null })}
            >
              <option value="">All accounts</option>
              {ACCOUNTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Date range
            <select
              className={selectClass}
              value={filters.range}
              onChange={(e) => setFilters({ range: e.target.value as DateRangePreset })}
            >
              {(Object.keys(RANGE_LABELS) as DateRangePreset[]).map((r) => (
                <option key={r} value={r}>
                  {RANGE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" id="group-filter-label">
              Group
            </span>
            <div role="group" aria-labelledby="group-filter-label" className="flex flex-wrap gap-1.5">
              {GROUP_ORDER.map((g) => {
                const active = filters.groups.includes(g)
                const Icon = GROUP_ICONS[g]
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setFilters({ groups: active ? filters.groups.filter((x) => x !== g) : [...filters.groups, g] })
                    }
                    className={cn(
                      'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
                      active ? cn(GROUP_STYLES[g].soft, GROUP_STYLES[g].text, 'border-current') : 'hover:bg-accent',
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {GROUPS[g].label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {filters.range === 'custom' ? (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              From
              <input
                type="date"
                className={selectClass}
                value={filters.from ?? ''}
                max={filters.to ?? undefined}
                onChange={(e) => setFilters({ from: e.target.value || null })}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              To
              <input
                type="date"
                className={selectClass}
                value={filters.to ?? ''}
                min={filters.from ?? undefined}
                onChange={(e) => setFilters({ to: e.target.value || null })}
              />
            </label>
          </div>
        ) : null}

        {tags.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" id="tag-filter-label">
              Tags
            </span>
            <div role="group" aria-labelledby="tag-filter-label" className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const active = filters.tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilters({ tags: active ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag] })}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      active ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    #{tag}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {chips.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <span className="text-xs font-medium text-muted-foreground">Active:</span>
            {chips.map((chip) => (
              <span key={chip.key} className="inline-flex items-center gap-1 rounded-full bg-muted py-0.5 pr-1 pl-2.5 text-xs font-medium">
                <span className="max-w-[14rem] truncate">{chip.label}</span>
                <button
                  type="button"
                  onClick={() => setFilters(chip.remove)}
                  className="rounded-full p-0.5 hover:bg-background"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
              <RotateCcw data-icon="inline-start" />
              Reset
            </Button>
          </div>
        ) : null}
      </section>

      {status === 'loading' ? (
        <HistorySkeleton />
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
          <p className="font-medium">No transactions yet</p>
          <p className="max-w-sm text-sm text-muted-foreground text-pretty">Record your first income, expense, or transfer and it will appear here by date.</p>
          <Button onClick={openEntry}>
            <Plus data-icon="inline-start" />
            Add transaction
          </Button>
        </div>
      ) : days.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
          <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">No entries match these filters</p>
          <p className="max-w-sm text-sm text-muted-foreground text-pretty">
            Your filters are still applied above. Remove one, or reset them all to see every entry.
          </p>
          <Button onClick={resetFilters}>
            <RotateCcw data-icon="inline-start" />
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {days.map((day) => {
            const net = day.items.reduce(
              (acc, t) => acc + (t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0),
              0,
            )
            return (
              <section key={day.key} aria-label={formatDayHeading(day.date)} className="overflow-hidden rounded-2xl border bg-card">
                <header className="flex items-center justify-between gap-3 border-b bg-muted/50 px-4 py-2">
                  <h2 className="text-sm font-semibold">{formatDayHeading(day.date)}</h2>
                  <span className={cn('text-xs font-medium tabular-nums', net > 0 ? 'text-positive' : 'text-muted-foreground')}>
                    {net > 0 ? '+' : net < 0 ? '−' : ''}
                    {formatMoney(Math.abs(net))} net
                  </span>
                </header>
                <ul className="divide-y">
                  {day.items.map((tx) => (
                    <li key={tx.id}>
                      <TransactionRow tx={tx} highlight={tx.id === highlightId} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function activeChips(filters: HistoryFilters) {
  const chips: { key: string; label: string; remove: Partial<HistoryFilters> }[] = []
  if (filters.accountId) chips.push({ key: 'account', label: accountName(filters.accountId), remove: { accountId: null } })
  for (const g of filters.groups) {
    chips.push({ key: `group-${g}`, label: GROUPS[g].label, remove: { groups: filters.groups.filter((x) => x !== g) } })
  }
  if (filters.range !== 'all') {
    const label =
      filters.range === 'custom'
        ? `${filters.from ?? 'Any start'} → ${filters.to ?? 'Any end'}`
        : RANGE_LABELS[filters.range]
    chips.push({ key: 'range', label, remove: { range: 'all', from: null, to: null } })
  }
  for (const t of filters.tags) {
    chips.push({ key: `tag-${t}`, label: `#${t}`, remove: { tags: filters.tags.filter((x) => x !== t) } })
  }
  return chips
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading history">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <div className="border-b px-4 py-2.5">
            <Skeleton className="h-4 w-40" />
          </div>
          {Array.from({ length: 3 }).map((__, j) => (
            <div key={j} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
