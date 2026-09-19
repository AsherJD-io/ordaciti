import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface SortButtonProps {
  label: string
  active?: boolean
  direction?: 'asc' | 'desc'
  onClick?: () => void
  className?: string
}

export function SortButton({ label, active = false, direction, onClick, className = '' }: SortButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-sm transition-colors',
        active ? 'border-primary/30 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {direction === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : direction === 'desc' ? (
        <ArrowDown className="h-3.5 w-3.5" />
      ) : null}
      {label}
    </button>
  )
}
