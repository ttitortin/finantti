'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_FILTERS, buildExampleTransactions } from '@/lib/finance/data'
import type { HistoryFilters, PersistedState, Transaction } from '@/lib/finance/types'

const STORAGE_KEY = 'ledgerline:v1'

const INITIAL: PersistedState = {
  version: 1,
  personal: [],
  examplesEnabled: true,
  lastAccountId: null,
  filters: DEFAULT_FILTERS,
}

type Status = 'loading' | 'ready' | 'error'

export type NewTransaction = Omit<Transaction, 'id' | 'source'>

type FinanceContextValue = {
  status: Status
  transactions: Transaction[]
  personal: Transaction[]
  examplesEnabled: boolean
  hasExamples: boolean
  recentAccountId: string | null
  filters: HistoryFilters
  entryOpen: boolean
  confirmation: Transaction | null
  openEntry: () => void
  setEntryOpen: (open: boolean) => void
  saveTransaction: (input: NewTransaction) => Promise<Transaction>
  dismissConfirmation: () => void
  removeExamples: () => void
  restoreExamples: () => void
  setFilters: (patch: Partial<HistoryFilters>) => void
  resetFilters: () => void
  retryLoad: () => void
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

function readStorage(): PersistedState {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return INITIAL
  const parsed = JSON.parse(raw) as Partial<PersistedState>
  return {
    ...INITIAL,
    ...parsed,
    filters: { ...DEFAULT_FILTERS, ...parsed.filters },
    personal: Array.isArray(parsed.personal) ? parsed.personal : [],
  }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [state, setState] = useState<PersistedState>(INITIAL)
  const [examples, setExamples] = useState<Transaction[]>([])
  const [entryOpen, setEntryOpen] = useState(false)
  const [confirmation, setConfirmation] = useState<Transaction | null>(null)

  const load = useCallback(() => {
    setStatus('loading')
    try {
      setState(readStorage())
      setExamples(buildExampleTransactions())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const commit = useCallback((next: PersistedState) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setState(next)
  }, [])

  const safeCommit = useCallback(
    (updater: (prev: PersistedState) => PersistedState) => {
      setState((prev) => {
        const next = updater(prev)
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // Storage can be full or blocked; keep the in-memory view so the session still works.
        }
        return next
      })
    },
    [],
  )

  const saveTransaction = useCallback(
    async (input: NewTransaction) => {
      await new Promise((r) => setTimeout(r, 450))
      const tx: Transaction = {
        ...input,
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
        source: 'personal',
      }
      const next: PersistedState = {
        ...state,
        personal: [tx, ...state.personal],
        lastAccountId: input.accountId,
      }
      commit(next)
      setConfirmation(tx)
      return tx
    },
    [commit, state],
  )

  const transactions = useMemo(() => {
    const list = state.examplesEnabled ? [...state.personal, ...examples] : [...state.personal]
    return list.sort((a, b) => b.date.localeCompare(a.date))
  }, [examples, state.examplesEnabled, state.personal])

  const recentAccountId = state.lastAccountId ?? transactions[0]?.accountId ?? null

  const value: FinanceContextValue = {
    status,
    transactions,
    personal: state.personal,
    examplesEnabled: state.examplesEnabled,
    hasExamples: state.examplesEnabled && examples.length > 0,
    recentAccountId,
    filters: state.filters,
    entryOpen,
    confirmation,
    openEntry: () => setEntryOpen(true),
    setEntryOpen,
    saveTransaction,
    dismissConfirmation: () => setConfirmation(null),
    removeExamples: () => safeCommit((prev) => ({ ...prev, examplesEnabled: false })),
    restoreExamples: () => safeCommit((prev) => ({ ...prev, examplesEnabled: true })),
    setFilters: (patch) => safeCommit((prev) => ({ ...prev, filters: { ...prev.filters, ...patch } })),
    resetFilters: () => safeCommit((prev) => ({ ...prev, filters: DEFAULT_FILTERS })),
    retryLoad: load,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
