import type { Metadata } from 'next'
import { HistoryView } from '@/components/finance/history-view'

export const metadata: Metadata = {
  title: 'History · Ledgerline',
  description: 'Every transaction grouped by date, filterable by account, group, date range, and tags.',
}

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ highlight?: string }> }) {
  const { highlight } = await searchParams
  return <HistoryView highlightId={highlight} />
}
