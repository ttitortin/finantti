import type { Account, Category, GroupId, HistoryFilters, Transaction } from './types'

export const ACCOUNTS: Account[] = [
  { id: 'harbor', name: 'Harbor Checking', type: 'checking', exampleOpeningBalance: 3240.55 },
  { id: 'northstar', name: 'Northstar Savings', type: 'savings', exampleOpeningBalance: 8650 },
  { id: 'cedar', name: 'Cedar Card', type: 'credit', exampleOpeningBalance: -312.4 },
  { id: 'joint', name: 'Joint Household Checking', type: 'checking', exampleOpeningBalance: 1180 },
]

export const GROUPS: Record<GroupId, { id: GroupId; label: string; description: string; hue: number }> = {
  needs: { id: 'needs', label: 'Needs', description: 'Essentials you have to cover', hue: 252 },
  wants: { id: 'wants', label: 'Wants', description: 'Lifestyle and discretionary spending', hue: 48 },
  savings: { id: 'savings', label: 'Savings', description: 'Money set aside for later', hue: 162 },
}

export const GROUP_ORDER: GroupId[] = ['needs', 'wants', 'savings']

export const CATEGORIES: Category[] = [
  { id: 'rent', name: 'Rent', group: 'needs', icon: 'House', kinds: ['expense'], pickable: true },
  { id: 'groceries', name: 'Groceries', group: 'needs', icon: 'ShoppingCart', kinds: ['expense'], pickable: true },
  { id: 'utilities', name: 'Utilities', group: 'needs', icon: 'Zap', kinds: ['expense'], pickable: true },
  { id: 'transport', name: 'Transport', group: 'needs', icon: 'Car', kinds: ['expense'], pickable: true },
  { id: 'insurance', name: 'Insurance', group: 'needs', icon: 'ShieldCheck', kinds: ['expense'], pickable: true },
  { id: 'healthcare', name: 'Healthcare', group: 'needs', icon: 'HeartPulse', kinds: ['expense'], pickable: true },
  {
    id: 'membership',
    name: 'Annual professional membership',
    group: 'needs',
    icon: 'BadgeCheck',
    kinds: ['expense'],
    pickable: true,
  },
  { id: 'dining', name: 'Dining', group: 'wants', icon: 'UtensilsCrossed', kinds: ['expense'], pickable: true },
  { id: 'streaming', name: 'Streaming', group: 'wants', icon: 'Tv', kinds: ['expense'], pickable: true },
  { id: 'travel', name: 'Travel', group: 'wants', icon: 'Plane', kinds: ['expense'], pickable: true },
  { id: 'shopping', name: 'Shopping', group: 'wants', icon: 'ShoppingBag', kinds: ['expense'], pickable: true },
  { id: 'entertainment', name: 'Entertainment', group: 'wants', icon: 'Ticket', kinds: ['expense'], pickable: true },
  { id: 'hobbies', name: 'Hobbies', group: 'wants', icon: 'Palette', kinds: ['expense'], pickable: true },
  { id: 'gifts', name: 'Gifts', group: 'wants', icon: 'Gift', kinds: ['expense'], pickable: true },
  { id: 'fitness', name: 'Fitness', group: 'wants', icon: 'Dumbbell', kinds: ['expense'], pickable: true },
  { id: 'emergency', name: 'Emergency Fund', group: 'savings', icon: 'LifeBuoy', kinds: ['expense'], pickable: true },
  { id: 'longterm', name: 'Long-Term Savings', group: 'savings', icon: 'PiggyBank', kinds: ['expense'], pickable: true },
  { id: 'retirement', name: 'Retirement', group: 'savings', icon: 'Landmark', kinds: ['expense'], pickable: true },
  { id: 'investments', name: 'Investments', group: 'savings', icon: 'TrendingUp', kinds: ['expense'], pickable: true },
  { id: 'salary', name: 'Salary', group: null, icon: 'Briefcase', kinds: ['income'], pickable: true },
  { id: 'freelance', name: 'Freelance', group: null, icon: 'Laptop', kinds: ['income'], pickable: true },
  { id: 'interest', name: 'Interest', group: null, icon: 'Percent', kinds: ['income'], pickable: true },
  { id: 'refund', name: 'Refund', group: null, icon: 'Undo2', kinds: ['income'], pickable: true },
  { id: 'other-income', name: 'Other income', group: null, icon: 'Coins', kinds: ['income'], pickable: true },
  {
    id: 'savings-transfer',
    name: 'Savings transfers',
    group: 'savings',
    icon: 'ArrowLeftRight',
    kinds: ['transfer'],
    pickable: false,
  },
  { id: 'transfer', name: 'Transfer', group: null, icon: 'ArrowLeftRight', kinds: ['transfer'], pickable: false },
]

export const SUGGESTED_TAGS = ['household', 'subscription', 'work', 'travel', 'date night']

export const DEFAULT_FILTERS: HistoryFilters = {
  accountId: null,
  groups: [],
  range: 'all',
  from: null,
  to: null,
  tags: [],
}

export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id)
export const accountById = (id: string | null | undefined) => ACCOUNTS.find((a) => a.id === id)

type Seed = {
  day: number
  time: string
  title: string
  amount: number
  type: Transaction['type']
  accountId: string
  toAccountId?: string
  categoryId: string
  tags?: string[]
}

const CURRENT_MONTH: Seed[] = [
  { day: 1, time: '09:05', title: 'Salary', amount: 4800, type: 'income', accountId: 'harbor', categoryId: 'salary', tags: ['work'] },
  { day: 2, time: '08:30', title: 'Rent', amount: 1650, type: 'expense', accountId: 'harbor', categoryId: 'rent', tags: ['household'] },
  { day: 3, time: '18:12', title: 'Electric & water', amount: 142.18, type: 'expense', accountId: 'harbor', categoryId: 'utilities', tags: ['household'] },
  { day: 4, time: '17:46', title: 'Groceries', amount: 126.4, type: 'expense', accountId: 'harbor', categoryId: 'groceries', tags: ['household'] },
  { day: 5, time: '21:10', title: 'Streaming', amount: 17.99, type: 'expense', accountId: 'cedar', categoryId: 'streaming', tags: ['subscription'] },
  { day: 6, time: '07:55', title: 'Transfer to savings', amount: 600, type: 'transfer', accountId: 'harbor', toAccountId: 'northstar', categoryId: 'savings-transfer' },
  { day: 7, time: '12:00', title: 'Emergency fund', amount: 250, type: 'expense', accountId: 'northstar', categoryId: 'emergency' },
  { day: 8, time: '20:24', title: 'Dinner at Lumen', amount: 48.6, type: 'expense', accountId: 'cedar', categoryId: 'dining', tags: ['date night'] },
  { day: 9, time: '08:15', title: 'Transit pass', amount: 64, type: 'expense', accountId: 'cedar', categoryId: 'transport' },
  { day: 10, time: '15:40', title: 'Freelance invoice', amount: 650, type: 'income', accountId: 'harbor', categoryId: 'freelance', tags: ['work'] },
  { day: 11, time: '18:02', title: 'Groceries', amount: 94.12, type: 'expense', accountId: 'harbor', categoryId: 'groceries', tags: ['household'] },
  { day: 12, time: '10:30', title: 'Weekend train fares', amount: 186, type: 'expense', accountId: 'cedar', categoryId: 'travel', tags: ['travel'] },
  { day: 12, time: '16:18', title: 'Running shoes', amount: 89.5, type: 'expense', accountId: 'cedar', categoryId: 'shopping' },
  { day: 13, time: '09:20', title: 'Design guild dues', amount: 225, type: 'expense', accountId: 'cedar', categoryId: 'membership', tags: ['work'] },
  { day: 14, time: '19:45', title: 'Concert tickets', amount: 72, type: 'expense', accountId: 'cedar', categoryId: 'entertainment' },
  { day: 14, time: '13:05', title: 'Watercolor supplies', amount: 34.2, type: 'expense', accountId: 'cedar', categoryId: 'hobbies' },
  { day: 15, time: '11:00', title: 'Retirement contribution', amount: 300, type: 'expense', accountId: 'harbor', categoryId: 'retirement' },
  { day: 15, time: '17:30', title: 'Birthday gift', amount: 45, type: 'expense', accountId: 'cedar', categoryId: 'gifts' },
  { day: 16, time: '07:10', title: 'Climbing gym', amount: 39, type: 'expense', accountId: 'cedar', categoryId: 'fitness', tags: ['subscription'] },
]

const PREVIOUS_MONTH: Seed[] = [
  { day: 1, time: '09:05', title: 'Salary', amount: 4800, type: 'income', accountId: 'harbor', categoryId: 'salary', tags: ['work'] },
  { day: 2, time: '08:30', title: 'Rent', amount: 1650, type: 'expense', accountId: 'harbor', categoryId: 'rent', tags: ['household'] },
  { day: 5, time: '18:40', title: 'Electric & water', amount: 131.4, type: 'expense', accountId: 'harbor', categoryId: 'utilities', tags: ['household'] },
  { day: 6, time: '07:55', title: 'Transfer to savings', amount: 600, type: 'transfer', accountId: 'harbor', toAccountId: 'northstar', categoryId: 'savings-transfer' },
  { day: 9, time: '17:20', title: 'Groceries', amount: 141.75, type: 'expense', accountId: 'harbor', categoryId: 'groceries', tags: ['household'] },
  { day: 14, time: '10:00', title: 'Renters insurance', amount: 28, type: 'expense', accountId: 'harbor', categoryId: 'insurance' },
  { day: 18, time: '08:10', title: 'Transit pass', amount: 64, type: 'expense', accountId: 'harbor', categoryId: 'transport' },
  { day: 22, time: '18:25', title: 'Groceries', amount: 108.3, type: 'expense', accountId: 'harbor', categoryId: 'groceries', tags: ['household'] },
  { day: 28, time: '12:00', title: 'Interest earned', amount: 21.62, type: 'income', accountId: 'northstar', categoryId: 'interest' },
]

function seedToTransaction(seed: Seed, year: number, month: number, maxDay: number, index: number): Transaction {
  const [h, m] = seed.time.split(':').map(Number)
  const date = new Date(year, month, Math.min(seed.day, maxDay), h, m)
  return {
    id: `ex-${year}-${month}-${index}`,
    title: seed.title,
    amount: seed.amount,
    type: seed.type,
    date: date.toISOString(),
    accountId: seed.accountId,
    toAccountId: seed.toAccountId,
    categoryId: seed.categoryId,
    tags: seed.tags ?? [],
    source: 'example',
  }
}

export function buildExampleTransactions(now = new Date()): Transaction[] {
  const year = now.getFullYear()
  const month = now.getMonth()
  const prev = new Date(year, month - 1, 1)
  const prevDays = new Date(prev.getFullYear(), prev.getMonth() + 1, 0).getDate()
  const today = now.getDate()

  const current = CURRENT_MONTH.map((s, i) => {
    const tx = seedToTransaction(s, year, month, today, i)
    if (new Date(tx.date).getTime() > now.getTime()) {
      const startOfToday = new Date(year, month, today).getTime()
      const clamped = Math.max(startOfToday, now.getTime() - (CURRENT_MONTH.length - i) * 60_000)
      return { ...tx, date: new Date(clamped).toISOString() }
    }
    return tx
  })
  const previous = PREVIOUS_MONTH.map((s, i) => seedToTransaction(s, prev.getFullYear(), prev.getMonth(), prevDays, i))
  return [...current, ...previous]
}
