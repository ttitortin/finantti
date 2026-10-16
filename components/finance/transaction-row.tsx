import { ArrowRight } from 'lucide-react'
import { categoryById } from '@/lib/finance/data'
import { formatMoney, formatTime } from '@/lib/finance/format'
import { accountName, groupOf } from '@/lib/finance/selectors'
import type { Transaction } from '@/lib/finance/types'
import { cn } from '@/lib/utils'
import { CategoryIcon, ExampleBadge, GROUP_STYLES, GroupBadge } from './icons'

const TYPE_LABEL: Record<Transaction['type'], string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
}

export function TransactionRow({ tx, highlight, compact }: { tx: Transaction; highlight?: boolean; compact?: boolean }) {
  const group = groupOf(tx)
  const category = categoryById(tx.categoryId)
  const sign = tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 transition-colors',
        highlight && 'bg-savings-soft/70 animate-in fade-in duration-700',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg',
          group ? cn(GROUP_STYLES[group].soft, GROUP_STYLES[group].text) : 'bg-muted text-muted-foreground',
        )}
      >
        <CategoryIcon categoryId={tx.categoryId} className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-medium" title={tx.title}>
            {tx.title}
          </p>
          <p
            className={cn(
              'shrink-0 text-sm font-semibold tabular-nums',
              tx.type === 'income' && 'text-positive',
              tx.type === 'transfer' && 'text-muted-foreground',
            )}
          >
            <span className="sr-only">{TYPE_LABEL[tx.type]} </span>
            {sign}
            {formatMoney(tx.amount)}
          </p>
        </div>

        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          {tx.type === 'transfer' ? (
            <>
              <span className="truncate">{accountName(tx.accountId)}</span>
              <ArrowRight className="size-3 shrink-0" aria-label="to" />
              <span className="truncate">{accountName(tx.toAccountId)}</span>
            </>
          ) : (
            <span className="truncate">{accountName(tx.accountId)}</span>
          )}
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{formatTime(tx.date)}</span>
        </p>

        {!compact ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80">{TYPE_LABEL[tx.type]}</span>
            {category && tx.type !== 'transfer' ? (
              <span className="max-w-full truncate rounded-full border px-2 py-0.5 text-xs" title={category.name}>
                {category.name}
              </span>
            ) : null}
            {group ? <GroupBadge group={group} /> : null}
            {tx.tags.map((tag) => (
              <span key={tag} className="rounded-full px-1.5 py-0.5 text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
            {tx.source === 'example' ? <ExampleBadge /> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
