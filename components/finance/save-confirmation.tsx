'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, X } from 'lucide-react'
import { GROUPS, categoryById } from '@/lib/finance/data'
import { formatMoney, formatTimestamp } from '@/lib/finance/format'
import { accountName, groupOf } from '@/lib/finance/selectors'
import type { Transaction } from '@/lib/finance/types'
import { useFinance } from './finance-provider'

export function describeTransaction(tx: Transaction) {
  const amount = formatMoney(tx.amount)
  const group = groupOf(tx)
  const category = categoryById(tx.categoryId)?.name
  if (tx.type === 'transfer') {
    return `${amount} from ${accountName(tx.accountId)} to ${accountName(tx.toAccountId)}${group ? `, ${GROUPS[group].label}` : ''}`
  }
  if (tx.type === 'income') return `${amount} to ${accountName(tx.accountId)}, ${category}`
  return `${amount} from ${accountName(tx.accountId)}, ${category}${group ? `, ${GROUPS[group].label}` : ''}`
}

export function SaveConfirmation() {
  const { confirmation, dismissConfirmation, resetFilters } = useFinance()

  useEffect(() => {
    if (!confirmation) return
    const timer = setTimeout(dismissConfirmation, 8000)
    return () => clearTimeout(timer)
  }, [confirmation, dismissConfirmation])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-40 z-40 flex justify-center px-4 sm:bottom-8">
      {confirmation ? (
        <div
          key={confirmation.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-savings-soft" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Saved {confirmation.type}</p>
            <p className="text-sm text-primary-foreground/85 text-pretty">{describeTransaction(confirmation)}</p>
            <p className="mt-0.5 text-xs text-primary-foreground/65">{formatTimestamp(confirmation.date)}</p>
            <Link
              href={`/history?highlight=${confirmation.id}`}
              onClick={() => {
                resetFilters()
                dismissConfirmation()
              }}
              className="mt-2 inline-block text-sm font-medium underline underline-offset-4"
            >
              View in history
            </Link>
          </div>
          <button
            type="button"
            onClick={dismissConfirmation}
            className="rounded-md p-1 text-primary-foreground/70 hover:text-primary-foreground"
            aria-label="Dismiss confirmation"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
