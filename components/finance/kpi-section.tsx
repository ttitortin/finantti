'use client'

import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Building2, CreditCard, Gauge, PiggyBank, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GROUPS } from '@/lib/finance/data'
import { formatMoney, formatPercent, formatTimestamp } from '@/lib/finance/format'
import type { AccountBalance, MonthSummary } from '@/lib/finance/selectors'
import { accountName } from '@/lib/finance/selectors'
import type { AccountType, Transaction } from '@/lib/finance/types'
import { cn } from '@/lib/utils'
import { CategoryIcon, GROUP_ICONS, GROUP_STYLES } from './icons'

type KpiId = 'networth' | 'inflow' | 'outflow' | 'rate'

const ACCOUNT_ICONS: Record<AccountType, typeof Wallet> = {
  checking: Building2,
  savings: PiggyBank,
  credit: CreditCard,
}

export function KpiSection({
  summary,
  balances,
  monthLabel,
  hasExamples,
  monthExpenses,
  onShowHistory,
}: {
  summary: MonthSummary
  balances: AccountBalance[]
  monthLabel: string
  hasExamples: boolean
  monthExpenses: Transaction[]
  onShowHistory: (kind: 'month' | 'income') => void
}) {
  const [open, setOpen] = useState<KpiId | null>(null)
  const netWorth = balances.reduce((acc, b) => acc + b.balance, 0)

  const cards: { id: KpiId; label: string; value: string; hint: string; icon: typeof Wallet; tone?: string }[] = [
    { id: 'networth', label: 'Total net worth', value: formatMoney(netWorth), hint: `Across ${balances.length} accounts`, icon: Wallet },
    {
      id: 'inflow',
      label: 'Monthly inflow',
      value: formatMoney(summary.inflow),
      hint: `${summary.incomeTransactions.length} income ${summary.incomeTransactions.length === 1 ? 'entry' : 'entries'}`,
      icon: ArrowDownLeft,
      tone: 'text-positive',
    },
    {
      id: 'outflow',
      label: 'Monthly outflow',
      value: formatMoney(summary.outflow),
      hint: `${monthExpenses.length} ${monthExpenses.length === 1 ? 'expense' : 'expenses'}`,
      icon: ArrowUpRight,
    },
    {
      id: 'rate',
      label: 'Net savings rate',
      value: summary.savingsRate == null ? '—' : formatPercent(summary.savingsRate),
      hint: summary.savingsRate == null ? 'Needs income to calculate' : `${formatMoney(summary.net)} kept this month`,
      icon: Gauge,
      tone: summary.savingsRate != null && summary.savingsRate < 0 ? 'text-destructive' : undefined,
    },
  ]

  return (
    <section aria-label="Key figures" className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          const active = open === card.id
          return (
            <button
              key={card.id}
              type="button"
              aria-expanded={active}
              aria-controls="kpi-context"
              onClick={() => setOpen(active ? null : card.id)}
              className={cn(
                'flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:border-foreground/20 focus-visible:outline-2',
                active && 'border-primary ring-1 ring-primary',
              )}
            >
              <span className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="truncate">{card.label}</span>
                <Icon className="size-4 shrink-0" aria-hidden="true" />
              </span>
              <span className={cn('truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl', card.tone)}>
                {card.value}
              </span>
              <span className="truncate text-xs text-muted-foreground">{card.hint}</span>
            </button>
          )
        })}
      </div>

      {open ? (
        <div
          id="kpi-context"
          className="rounded-2xl border bg-card p-5 animate-in fade-in slide-in-from-top-2 duration-300 motion-reduce:animate-none"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <h3 className="font-semibold">{cards.find((c) => c.id === open)?.label} · details</h3>
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(null)} aria-label="Close details">
              <X />
            </Button>
          </div>
          {open === 'networth' ? <NetWorthContext balances={balances} netWorth={netWorth} hasExamples={hasExamples} /> : null}
          {open === 'inflow' ? (
            <InflowContext summary={summary} monthLabel={monthLabel} onShowHistory={() => onShowHistory('income')} />
          ) : null}
          {open === 'outflow' ? (
            <OutflowContext summary={summary} monthExpenses={monthExpenses} onShowHistory={() => onShowHistory('month')} />
          ) : null}
          {open === 'rate' ? <RateContext summary={summary} /> : null}
        </div>
      ) : null}
    </section>
  )
}

function NetWorthContext({ balances, netWorth, hasExamples }: { balances: AccountBalance[]; netWorth: number; hasExamples: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y">
        {balances.map(({ account, balance }) => {
          const Icon = ACCOUNT_ICONS[account.type]
          return (
            <li key={account.id} className="flex items-center gap-3 py-2.5">
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{account.name}</span>
                <span className="text-xs capitalize text-muted-foreground">{account.type}</span>
              </span>
              <span className={cn('text-sm font-semibold tabular-nums', balance < 0 && 'text-destructive')}>{formatMoney(balance)}</span>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-muted-foreground text-pretty">
        Net worth is every account balance added together ({formatMoney(netWorth)}). Credit balances count against it.
        {hasExamples ? ' Opening balances are example figures.' : ''}
      </p>
    </div>
  )
}

function InflowContext({ summary, monthLabel, onShowHistory }: { summary: MonthSummary; monthLabel: string; onShowHistory: () => void }) {
  if (summary.incomeTransactions.length === 0) {
    return <p className="text-sm text-muted-foreground">No income recorded for {monthLabel} yet.</p>
  }
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y">
        {summary.incomeTransactions.map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-2.5">
            <CategoryIcon categoryId={t.categoryId} className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{t.title}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {accountName(t.accountId)} · {formatTimestamp(t.date)}
              </span>
            </span>
            <span className="text-sm font-semibold text-positive tabular-nums">+{formatMoney(t.amount)}</span>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" className="self-start" onClick={onShowHistory}>
        See this month in history
      </Button>
    </div>
  )
}

function OutflowContext({
  summary,
  monthExpenses,
  onShowHistory,
}: {
  summary: MonthSummary
  monthExpenses: Transaction[]
  onShowHistory: () => void
}) {
  const expenseByGroup = summary.groups.map((g) => ({
    group: g.group,
    amount: monthExpenses
      .filter((t) => g.categories.some((c) => c.categoryId === t.categoryId))
      .reduce((acc, t) => acc + t.amount, 0),
  }))
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-2 sm:grid-cols-3">
        {expenseByGroup.map(({ group, amount }) => {
          const Icon = GROUP_ICONS[group]
          return (
            <li key={group} className={cn('flex items-center gap-3 rounded-xl p-3', GROUP_STYLES[group].soft)}>
              <Icon className={cn('size-4 shrink-0', GROUP_STYLES[group].text)} aria-hidden="true" />
              <span className="flex-1 text-sm font-medium">{GROUPS[group].label}</span>
              <span className="text-sm font-semibold tabular-nums">{formatMoney(amount)}</span>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-muted-foreground text-pretty">
        Outflow counts expenses only. Transfers between your own accounts move money without leaving it, so they are left out.
      </p>
      <Button variant="outline" size="sm" className="self-start" onClick={onShowHistory}>
        See this month in history
      </Button>
    </div>
  )
}

function RateContext({ summary }: { summary: MonthSummary }) {
  const savings = summary.groups.find((g) => g.group === 'savings')?.amount ?? 0
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm tabular-nums">
        <span className="rounded-lg bg-muted px-2.5 py-1">({formatMoney(summary.inflow)} inflow</span>
        <span aria-hidden="true">−</span>
        <span className="rounded-lg bg-muted px-2.5 py-1">{formatMoney(summary.outflow)} outflow)</span>
        <span aria-hidden="true">÷</span>
        <span className="rounded-lg bg-muted px-2.5 py-1">{formatMoney(summary.inflow)}</span>
        <span aria-hidden="true">=</span>
        <span className="rounded-lg bg-primary px-2.5 py-1 font-semibold text-primary-foreground">
          {summary.savingsRate == null ? '—' : formatPercent(summary.savingsRate, 1)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground text-pretty">
        Your net savings rate is the share of this month&apos;s income you kept after expenses. Separately, {formatMoney(savings)} went
        directly into the Savings group through savings categories and transfers.
      </p>
    </div>
  )
}
