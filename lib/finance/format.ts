const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const currencyCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const formatMoney = (value: number) => currency.format(value)
export const formatMoneyRounded = (value: number) => currencyCompact.format(value)

export const formatPercent = (value: number, digits = 0) =>
  `${(value * 100).toFixed(digits).replace(/\.0+$/, '')}%`

export const formatMonth = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

export const formatDayHeading = (date: Date, now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const that = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((today.getTime() - that.getTime()) / 86_400_000)
  const label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  if (diff === 0) return `Today · ${label}`
  if (diff === 1) return `Yesterday · ${label}`
  return label
}

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

export const toLocalInputValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
