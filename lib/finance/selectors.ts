import { ACCOUNTS, CATEGORIES, GROUP_ORDER, accountById, categoryById } from './data'
import type { Account, GroupId, HistoryFilters, Transaction } from './types'

export function groupOf(tx: Transaction): GroupId | null {
  return categoryById(tx.categoryId)?.group ?? null
}

export function isInMonth(iso: string, month: Date) {
  const d = new Date(iso)
  return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
}

export type CategoryTotal = { categoryId: string; name: string; amount: number; count: number }
export type GroupTotal = { group: GroupId; amount: number; count: number; categories: CategoryTotal[] }

export type MonthSummary = {
  inflow: number
  outflow: number
  net: number
  savingsRate: number | null
  groupedTotal: number
  groups: GroupTotal[]
  incomeTransactions: Transaction[]
  transactionCount: number
}

export function summarizeMonth(transactions: Transaction[], month: Date): MonthSummary {
  const inMonth = transactions.filter((t) => isInMonth(t.date, month))
  const income = inMonth.filter((t) => t.type === 'income')
  const inflow = sum(income.map((t) => t.amount))
  const outflow = sum(inMonth.filter((t) => t.type === 'expense').map((t) => t.amount))

  const groups: GroupTotal[] = GROUP_ORDER.map((group) => {
    const groupTx = inMonth.filter((t) => t.type !== 'income' && groupOf(t) === group)
    const byCategory = new Map<string, CategoryTotal>()
    for (const t of groupTx) {
      const existing = byCategory.get(t.categoryId)
      if (existing) {
        existing.amount += t.amount
        existing.count += 1
      } else {
        byCategory.set(t.categoryId, {
          categoryId: t.categoryId,
          name: categoryById(t.categoryId)?.name ?? 'Uncategorized',
          amount: t.amount,
          count: 1,
        })
      }
    }
    const categories = [...byCategory.values()].sort((a, b) => b.amount - a.amount)
    return { group, amount: sum(categories.map((c) => c.amount)), count: groupTx.length, categories }
  })

  return {
    inflow,
    outflow,
    net: inflow - outflow,
    savingsRate: inflow > 0 ? (inflow - outflow) / inflow : null,
    groupedTotal: sum(groups.map((g) => g.amount)),
    groups,
    incomeTransactions: income.sort((a, b) => b.date.localeCompare(a.date)),
    transactionCount: inMonth.length,
  }
}

export type AccountBalance = { account: Account; balance: number }

export function accountBalances(transactions: Transaction[], includeOpening: boolean): AccountBalance[] {
  const balances = new Map<string, number>(ACCOUNTS.map((a) => [a.id, includeOpening ? a.exampleOpeningBalance : 0]))
  const add = (id: string | undefined, delta: number) => {
    if (id && balances.has(id)) balances.set(id, (balances.get(id) ?? 0) + delta)
  }
  for (const t of transactions) {
    if (t.type === 'income') add(t.accountId, t.amount)
    else if (t.type === 'expense') add(t.accountId, -t.amount)
    else {
      add(t.accountId, -t.amount)
      add(t.toAccountId, t.amount)
    }
  }
  return ACCOUNTS.map((account) => ({ account, balance: balances.get(account.id) ?? 0 }))
}

export function resolveRange(filters: HistoryFilters, now = new Date()): { from: Date | null; to: Date | null } {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  switch (filters.range) {
    case 'this-month':
      return { from: startOfMonth, to: null }
    case 'last-month':
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(startOfMonth.getTime() - 1) }
    case 'last-30':
      return { from: new Date(now.getTime() - 30 * 86_400_000), to: null }
    case 'custom':
      return {
        from: filters.from ? new Date(`${filters.from}T00:00:00`) : null,
        to: filters.to ? new Date(`${filters.to}T23:59:59.999`) : null,
      }
    default:
      return { from: null, to: null }
  }
}

export function applyFilters(transactions: Transaction[], filters: HistoryFilters) {
  const { from, to } = resolveRange(filters)
  return transactions.filter((t) => {
    if (filters.accountId && t.accountId !== filters.accountId && t.toAccountId !== filters.accountId) return false
    if (filters.groups.length > 0) {
      const g = groupOf(t)
      if (!g || !filters.groups.includes(g)) return false
    }
    const time = new Date(t.date).getTime()
    if (from && time < from.getTime()) return false
    if (to && time > to.getTime()) return false
    if (filters.tags.length > 0 && !filters.tags.some((tag) => t.tags.includes(tag))) return false
    return true
  })
}

export function groupByDay(transactions: Transaction[]) {
  const days = new Map<string, Transaction[]>()
  for (const t of [...transactions].sort((a, b) => b.date.localeCompare(a.date))) {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const list = days.get(key)
    if (list) list.push(t)
    else days.set(key, [t])
  }
  return [...days.entries()].map(([key, items]) => ({ key, date: new Date(`${key}T12:00:00`), items }))
}

export function allTags(transactions: Transaction[]) {
  return [...new Set(transactions.flatMap((t) => t.tags))].sort()
}

export function accountName(id: string | null | undefined) {
  return accountById(id)?.name ?? 'Unknown account'
}

export function pickableCategories(type: Transaction['type']) {
  return CATEGORIES.filter((c) => c.pickable && c.kinds.includes(type))
}

function sum(values: number[]) {
  return values.reduce((acc, v) => acc + v, 0)
}
