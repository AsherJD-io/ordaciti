import React from 'react'
import { Badge } from './Badge'

interface SignalCardProps {
  type: string
  title: string
  children: React.ReactNode
  className?: string
}

export function SignalCard({ type, title, children, className = '' }: SignalCardProps) {
  const typeColors: Record<string, string> = {
    REPEAT_INTERVENTION: 'border-l-4 border-l-amber-500',
    CONTRACTOR_RECURRENCE: 'border-l-4 border-l-blue-500',
    EVIDENCE_GAP: 'border-l-4 border-l-red-400',
  }

  return (
    <div className={['rounded-lg border border-border bg-card p-4 border-l-4', typeColors[type] ?? 'border-l-4 border-l-gray-300', className].join(' ')}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-medium text-sm text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  )
}
