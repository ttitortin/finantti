'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListOrdered, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FinanceProvider, useFinance } from './finance-provider'
import { SaveConfirmation } from './save-confirmation'
import { TransactionEntrySheet } from './transaction-entry-sheet'

const NAV = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/history', label: 'History', icon: ListOrdered },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <ShellFrame>{children}</ShellFrame>
    </FinanceProvider>
  )
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { openEntry, status } = useFinance()

  return (
    <div className="min-h-dvh pb-24 sm:pb-12">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">
              <span className="block size-3 rounded-full border-2 border-current" />
            </span>
            Ledgerline
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur sm:hidden">
        <div className="grid grid-cols-2 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <button
        type="button"
        onClick={openEntry}
        disabled={status === 'loading'}
        className="fixed bottom-20 left-1/2 z-40 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 sm:bottom-8 sm:left-auto sm:right-8 sm:translate-x-0"
        aria-label="Add transaction"
      >
        <Plus className="size-6" aria-hidden="true" />
      </button>

      <TransactionEntrySheet />
      <SaveConfirmation />
    </div>
  )
}
