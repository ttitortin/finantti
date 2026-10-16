'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Info, Plus, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_FILTERS } from '@/lib/finance/data'
import { formatMonth } from '@/lib/finance/format'
import { accountBalances, isInMonth, summarizeMonth } from '@/lib/finance/selectors'
import type { GroupId, HistoryFilters } from '@/lib/finance/types'
import { useFinance } from './finance-provider'
import { KpiSection } from './kpi-section'
import { SpendingBreakdown } from './spending-breakdown'
import { TransactionRow } from './transaction-row'

function monthFilter(month: Date): Partial<HistoryFilters> {
  const now = new Date()
  if (month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth()) {
    return { range: 'this-month', from: null, to: null }
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  return {
    range: 'custom',
    from: `${month.getFullYear()}-${pad(month.getMonth() + 1)}-01`,
    to: `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`,
  }
}

export function Dashboard() {
  const router = useRouter()
  const { status, transactions, personal, hasExamples, examplesEnabled, openEntry, removeExamples, restoreExamples, setFilters, retryLoad } =
    useFinance()
  const [monthOffset, setMonthOffset] = useState(0)

  const month = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  }, [monthOffset])
  const monthLabel = formatMonth(month)

  const summary = useMemo(() => summarizeMonth(transactions, month), [transactions, month])
  const balances = useMemo(() => accountBalances(transactions, examplesEnabled), [transactions, examplesEnabled])
  const monthExpenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense' && isInMonth(t.date, month)),
    [transactions, month],
  )
  const recent = transactions.slice(0, 5)

  const goToHistory = (patch: Partial<HistoryFilters>) => {
    setFilters({ ...DEFAULT_FILTERS, ...monthFilter(month), ...patch })
    router.push('/history')
  }

  if (status === 'loading') return <DashboardSkeleton />

  return (
    <div className="flex flex-col gap-6">
      {status === 'error' ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p>We couldn&apos;t load your saved entries. You&apos;re seeing the last available view.</p>
          <Button variant="outline" size="sm" onClick={retryLoad}>
            <RotateCcw data-icon="inline-start" />
            Try again
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Your money picture</p>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Overview</h1>
        </div>
        <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setMonthOffset((m) => m - 1)} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium" aria-live="polite">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMonthOffset((m) => Math.min(0, m + 1))}
            disabled={monthOffset === 0}
            aria-label="Next month"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <ExampleNotice
        hasExamples={hasExamples}
        personalCount={personal.length}
        totalCount={transactions.length}
        onAdd={openEntry}
        onRemove={removeExamples}
        onRestore={restoreExamples}
      />

      <KpiSection
        summary={summary}
        balances={balances}
        monthLabel={monthLabel}
        hasExamples={hasExamples}
        monthExpenses={monthExpenses}
        onShowHistory={() => goToHistory({})}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <SpendingBreakdown
          key={monthLabel}
          summary={summary}
          monthLabel={monthLabel}
          onAdd={openEntry}
          onViewTransactions={(group: GroupId) => goToHistory({ groups: [group] })}
        />

        <section aria-labelledby="recent-heading" className="flex flex-col rounded-2xl border bg-card">
          <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
            <h2 id="recent-heading" className="text-base font-semibold">
              Recent activity
            </h2>
            <Link href="/history" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              See all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <p className="text-sm font-medium">Nothing recorded yet</p>
              <p className="text-sm text-muted-foreground">Your latest entries will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y pb-2">
              {recent.map((tx) => (
                <li key={tx.id}>
                  <TransactionRow tx={tx} compact />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function ExampleNotice({
  hasExamples,
  personalCount,
  totalCount,
  onAdd,
  onRemove,
  onRestore,
}: {
  hasExamples: boolean
  personalCount: number
  totalCount: number
  onAdd: () => void
  onRemove: () => void
  onRestore: () => void
}) {
  if (totalCount === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-dashed bg-card p-5 sm:flex-row sm:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Info className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">No personal transactions yet</p>
          <p className="text-sm text-muted-foreground text-pretty">
            Totals start at zero. Add your first transaction and it will sort into Needs, Wants, or Savings right away.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onRestore}>
            Show examples
          </Button>
          <Button onClick={onAdd}>
            <Plus data-icon="inline-start" />
            Add transaction
          </Button>
        </div>
      </div>
    )
  }

  if (!hasExamples) return null

  const mixed = personalCount > 0
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-primary/30 bg-card p-5 sm:flex-row sm:items-center">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wants-soft text-wants">
        <Sparkles className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{mixed ? 'Your entries are mixed with example data' : 'You’re looking at example activity'}</p>
        <p className="text-sm text-muted-foreground text-pretty">
          {mixed
            ? `You've added ${personalCount} ${personalCount === 1 ? 'entry' : 'entries'}. Example rows are marked "Example" and can be removed anytime.`
            : 'These made-up entries show how income, spending, and savings fit together. None of it is yours yet.'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onRemove}>
          Remove examples
        </Button>
        {!mixed ? (
          <Button onClick={onAdd}>
            <Plus data-icon="inline-start" />
            Add your first
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading overview">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-44" />
        </div>
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>
      <Skeleton className="h-24 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5 rounded-2xl border bg-card p-6">
          <Skeleton className="h-5 w-48" />
          <div className="grid items-center gap-6 sm:grid-cols-[220px_1fr]">
            <Skeleton className="mx-auto aspect-square w-full max-w-[220px] rounded-full" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  )
}
