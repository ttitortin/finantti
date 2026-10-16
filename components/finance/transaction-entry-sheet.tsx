'use client'

import { useId, useState } from 'react'
import { AlertCircle, ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { ACCOUNTS, GROUPS, GROUP_ORDER, SUGGESTED_TAGS, accountById, categoryById } from '@/lib/finance/data'
import { formatMoney, toLocalInputValue } from '@/lib/finance/format'
import { pickableCategories } from '@/lib/finance/selectors'
import type { GroupId, TransactionType } from '@/lib/finance/types'
import { cn } from '@/lib/utils'
import { useFinance } from './finance-provider'
import { CategoryIcon, GROUP_ICONS, GROUP_STYLES, GroupBadge } from './icons'

export function TransactionEntrySheet() {
  const { entryOpen, setEntryOpen } = useFinance()
  const [session, setSession] = useState(0)

  return (
    <Sheet
      open={entryOpen}
      onOpenChange={(open) => {
        if (open) setSession((s) => s + 1)
        setEntryOpen(open)
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-h-[92dvh] w-full max-w-xl gap-0 rounded-t-3xl border-x p-0 sm:bottom-4 sm:rounded-3xl sm:border"
      >
        {entryOpen ? <EntryForm key={session} onClose={() => setEntryOpen(false)} /> : null}
      </SheetContent>
    </Sheet>
  )
}

const TYPES: { id: TransactionType; label: string; icon: typeof ArrowUpRight }[] = [
  { id: 'expense', label: 'Expense', icon: ArrowUpRight },
  { id: 'income', label: 'Income', icon: ArrowDownLeft },
  { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
]

type Errors = Partial<Record<'amount' | 'date' | 'account' | 'toAccount' | 'category' | 'save', string>>

function EntryForm({ onClose }: { onClose: () => void }) {
  const { recentAccountId, saveTransaction } = useFinance()
  const ids = useId()
  const recent = accountById(recentAccountId) ? recentAccountId : null

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => toLocalInputValue(new Date()))
  const [accountId, setAccountId] = useState<string | null>(recent)
  const [toAccountId, setToAccountId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [groupTab, setGroupTab] = useState<GroupId | 'all'>('all')
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [note, setNote] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const parsedAmount = Number.parseFloat(amount.replace(/[$,\s]/g, ''))
  const category = categoryId ? categoryById(categoryId) : undefined
  const toAccount = accountById(toAccountId)
  const transferGroup: GroupId | null = toAccount?.type === 'savings' ? 'savings' : null

  const errors: Errors = {}
  if (!amount.trim()) errors.amount = 'Enter an amount to continue.'
  else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) errors.amount = 'A positive amount is required, like 42.80.'
  if (!date || Number.isNaN(new Date(date).getTime())) errors.date = 'Choose a date and time.'
  if (!accountId) errors.account = type === 'transfer' ? 'Choose the account money leaves.' : 'Choose an account. None is assumed.'
  if (type === 'transfer') {
    if (!toAccountId) errors.toAccount = 'Choose the account money goes to.'
    else if (toAccountId === accountId) errors.toAccount = 'Pick two different accounts.'
  } else if (!categoryId) {
    errors.category = 'Choose a category.'
  }
  const visibleErrors: Errors = attempted ? errors : {}
  const hasErrors = Object.keys(errors).length > 0

  const changeType = (next: TransactionType) => {
    setType(next)
    setCategoryId((current) => {
      const c = current ? categoryById(current) : undefined
      return c && c.kinds.includes(next) ? current : null
    })
    if (next !== 'transfer') setToAccountId(null)
    setGroupTab('all')
  }

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/^#/, '')
    if (tag && !tags.includes(tag) && tags.length < 8) setTags([...tags, tag.slice(0, 24)])
    setTagDraft('')
  }

  const handleSave = async () => {
    setAttempted(true)
    setSaveError(null)
    if (hasErrors || !accountId) return
    setSaving(true)
    try {
      const finalCategory = type === 'transfer' ? (transferGroup ? 'savings-transfer' : 'transfer') : (categoryId as string)
      const title =
        note.trim() ||
        (type === 'transfer' ? `Transfer to ${toAccount?.name ?? 'account'}` : (category?.name ?? 'Transaction'))
      await saveTransaction({
        title: title.slice(0, 80),
        amount: Math.round(parsedAmount * 100) / 100,
        type,
        date: new Date(date).toISOString(),
        accountId,
        toAccountId: type === 'transfer' ? (toAccountId ?? undefined) : undefined,
        categoryId: finalCategory,
        tags,
      })
      onClose()
    } catch {
      setSaveError('We couldn’t save this entry. Your details are still here, so you can try again.')
    } finally {
      setSaving(false)
    }
  }

  const categories = pickableCategories(type).filter((c) => type !== 'expense' || groupTab === 'all' || c.group === groupTab)
  const typeLabel = TYPES.find((t) => t.id === type)?.label ?? 'Expense'

  return (
    <form
      className="flex max-h-[92dvh] flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        handleSave()
      }}
      noValidate
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div>
          <SheetTitle className="text-base font-semibold">New transaction</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">Check the type, account, and category before saving.</SheetDescription>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <X />
        </Button>
      </div>
      <div className="mx-auto -mt-1 mb-1 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden="true" />

      <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-5">
        <div role="radiogroup" aria-label="Transaction type" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {TYPES.map((t) => {
            const Icon = t.icon
            const active = type === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => changeType(t.id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all',
                  active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${ids}-amount`}>Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">$</span>
              <Input
                id={`${ids}-amount`}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={!!visibleErrors.amount}
                aria-describedby={visibleErrors.amount ? `${ids}-amount-error` : undefined}
                className="h-12 pl-7 text-2xl font-semibold tabular-nums"
              />
            </div>
            <FieldError id={`${ids}-amount-error`} message={visibleErrors.amount} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${ids}-date`}>Date & time</Label>
            <Input
              id={`${ids}-date`}
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={!!visibleErrors.date}
              className="h-12"
            />
            <FieldError message={visibleErrors.date} />
          </div>
        </div>

        <AccountPicker
          label={type === 'transfer' ? 'From account' : type === 'income' ? 'Deposit to' : 'Paid from'}
          value={accountId}
          onChange={setAccountId}
          recentId={recent}
          error={visibleErrors.account}
          hint={recent ? undefined : 'No recent account yet, so pick one. We’ll remember it next time.'}
        />

        {type === 'transfer' ? (
          <>
            <AccountPicker
              label="To account"
              value={toAccountId}
              onChange={setToAccountId}
              disabledId={accountId}
              error={visibleErrors.toAccount}
            />
            <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm">
              {transferGroup ? (
                <>
                  <span className="text-muted-foreground">Counts toward</span>
                  <GroupBadge group="savings" />
                </>
              ) : (
                <span className="text-muted-foreground text-pretty">
                  {toAccount ? 'Moves money between accounts. Not counted in Needs, Wants, or Savings.' : 'Transfers into a savings account count toward Savings.'}
                </span>
              )}
            </div>
          </>
        ) : (
          <div role="group" aria-labelledby={`${ids}-category`} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span id={`${ids}-category`} className="text-sm font-medium">Category</span>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
                {category ? (
                  <>
                    <span className="max-w-[12rem] truncate font-medium text-foreground">{category.name}</span>
                    {category.group ? (
                      <>
                        <span>belongs to</span>
                        <GroupBadge group={category.group} />
                      </>
                    ) : (
                      <span>· Income</span>
                    )}
                  </>
                ) : (
                  'Nothing selected yet'
                )}
              </p>
            </div>
            {type === 'expense' ? (
              <div className="flex gap-1.5 overflow-x-auto" role="group" aria-label="Show categories from">
                {(['all', ...GROUP_ORDER] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={groupTab === g}
                    onClick={() => setGroupTab(g)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      groupTab === g ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
                    )}
                  >
                    {g === 'all' ? 'All' : GROUPS[g].label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {categories.map((c) => {
                const selected = categoryId === c.id
                const GroupIcon = c.group ? GROUP_ICONS[c.group] : null
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategoryId(c.id)}
                    className={cn(
                      'relative flex min-h-20 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-center transition-all hover:bg-accent',
                      selected && 'border-primary bg-accent ring-1 ring-primary',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        c.group ? cn(GROUP_STYLES[c.group].soft, GROUP_STYLES[c.group].text) : 'bg-savings-soft text-positive',
                      )}
                    >
                      <CategoryIcon categoryId={c.id} className="size-4" />
                    </span>
                    <span className="line-clamp-2 w-full text-xs leading-tight font-medium break-words">{c.name}</span>
                    {GroupIcon && c.group ? (
                      <span className={cn('absolute top-1.5 right-1.5', GROUP_STYLES[c.group].text)} title={GROUPS[c.group].label}>
                        <GroupIcon className="size-3" aria-hidden="true" />
                        <span className="sr-only">{GROUPS[c.group].label}</span>
                      </span>
                    ) : null}
                    {selected ? (
                      <span className="absolute top-1.5 left-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
            <FieldError message={visibleErrors.category} />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${ids}-tags`}>
            Tags <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input px-2 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} aria-label={`Remove tag ${tag}`}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <input
              id={`${ids}-tags`}
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag(tagDraft)
                } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
                  setTags(tags.slice(0, -1))
                }
              }}
              onBlur={() => tagDraft && addTag(tagDraft)}
              placeholder={tags.length ? '' : 'Type and press Enter'}
              className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${ids}-note`}>
            Description <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id={`${ids}-note`}
            value={note}
            maxLength={80}
            onChange={(e) => setNote(e.target.value)}
            placeholder={type === 'transfer' ? 'Transfer to savings' : (category?.name ?? 'e.g. Weekly groceries')}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t bg-card px-5 py-4">
        {saveError ? (
          <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {saveError}
          </p>
        ) : null}
        {attempted && hasErrors ? (
          <p role="alert" className="text-sm text-destructive">
            Fix the highlighted {Object.keys(errors).length === 1 ? 'field' : 'fields'} to save.
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {Number.isFinite(parsedAmount) && parsedAmount > 0 ? (
              <>
                <span className="font-semibold text-foreground tabular-nums">{formatMoney(parsedAmount)}</span>
                {accountId ? ` · ${accountById(accountId)?.name}` : ''}
              </>
            ) : (
              `${typeLabel} · no amount yet`
            )}
          </p>
          <Button type="submit" size="lg" disabled={saving} className="h-11 min-w-32 px-5">
            {saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
            {saving ? 'Saving…' : `Save ${typeLabel.toLowerCase()}`}
          </Button>
        </div>
      </div>
    </form>
  )
}

function AccountPicker({
  label,
  value,
  onChange,
  recentId,
  disabledId,
  error,
  hint,
}: {
  label: string
  value: string | null
  onChange: (id: string) => void
  recentId?: string | null
  disabledId?: string | null
  error?: string
  hint?: string
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2">
        {ACCOUNTS.map((a) => {
          const selected = value === a.id
          const disabled = disabledId === a.id
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(a.id)}
              className={cn(
                'flex min-w-0 flex-col items-start rounded-xl border px-3 py-2 text-left transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40',
                selected && 'border-primary bg-accent ring-1 ring-primary',
                error && !value && 'border-destructive/60',
              )}
            >
              <span className="w-full truncate text-sm font-medium" title={a.name}>
                {a.name}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="capitalize">{a.type}</span>
                {recentId === a.id ? <span className="rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">Recent</span> : null}
              </span>
            </button>
          )
        })}
      </div>
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <FieldError message={error} />
    </fieldset>
  )
}

function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}
