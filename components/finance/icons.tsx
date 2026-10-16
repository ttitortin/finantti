import {
  ArrowLeftRight,
  BadgeCheck,
  Briefcase,
  Car,
  Coins,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  LifeBuoy,
  Palette,
  Percent,
  PiggyBank,
  Plane,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sprout,
  Ticket,
  TrendingUp,
  Tv,
  Undo2,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { categoryById, GROUPS } from '@/lib/finance/data'
import type { GroupId } from '@/lib/finance/types'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  ArrowLeftRight,
  BadgeCheck,
  Briefcase,
  Car,
  Coins,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  LifeBuoy,
  Palette,
  Percent,
  PiggyBank,
  Plane,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  TrendingUp,
  Tv,
  Undo2,
  UtensilsCrossed,
  Zap,
}

export const GROUP_ICONS: Record<GroupId, LucideIcon> = {
  needs: Shield,
  wants: Sparkles,
  savings: Sprout,
}

export const GROUP_STYLES: Record<GroupId, { text: string; bg: string; soft: string; fill: string }> = {
  needs: { text: 'text-needs', bg: 'bg-needs', soft: 'bg-needs-soft', fill: 'var(--needs)' },
  wants: { text: 'text-wants', bg: 'bg-wants', soft: 'bg-wants-soft', fill: 'var(--wants)' },
  savings: { text: 'text-savings', bg: 'bg-savings', soft: 'bg-savings-soft', fill: 'var(--savings)' },
}

export function CategoryIcon({ categoryId, className }: { categoryId: string; className?: string }) {
  const Icon = ICONS[categoryById(categoryId)?.icon ?? ''] ?? Coins
  return <Icon className={className} aria-hidden="true" />
}

export function GroupBadge({ group, className }: { group: GroupId; className?: string }) {
  const Icon = GROUP_ICONS[group]
  const style = GROUP_STYLES[group]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        style.soft,
        style.text,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {GROUPS[group].label}
    </span>
  )
}

export function ExampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-dashed border-muted-foreground/40 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground',
        className,
      )}
    >
      Example
    </span>
  )
}
