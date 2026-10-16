export type TransactionType = 'income' | 'expense' | 'transfer'
export type GroupId = 'needs' | 'wants' | 'savings'
export type AccountType = 'checking' | 'savings' | 'credit'
export type RecordSource = 'example' | 'personal'

export type Account = {
  id: string
  name: string
  type: AccountType
  exampleOpeningBalance: number
}

export type Category = {
  id: string
  name: string
  group: GroupId | null
  icon: string
  kinds: TransactionType[]
  pickable: boolean
}

export type Transaction = {
  id: string
  title: string
  amount: number
  type: TransactionType
  date: string
  accountId: string
  toAccountId?: string
  categoryId: string
  tags: string[]
  source: RecordSource
}

export type DateRangePreset = 'all' | 'this-month' | 'last-month' | 'last-30' | 'custom'

export type HistoryFilters = {
  accountId: string | null
  groups: GroupId[]
  range: DateRangePreset
  from: string | null
  to: string | null
  tags: string[]
}

export type PersistedState = {
  version: 1
  personal: Transaction[]
  examplesEnabled: boolean
  lastAccountId: string | null
  filters: HistoryFilters
}
