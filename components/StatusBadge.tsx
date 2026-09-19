import React from 'react'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-green-50 text-green-700 border-green-200' },
  partial: { label: 'Partial', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  missing: { label: 'Missing', className: 'bg-red-50 text-red-700 border-red-200' },
  unknown: { label: 'Unknown', className: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.unknown
  return (
    <span
      className={[
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border',
        config.className,
        className,
      ].join(' ')}
    >
      {config.label}
    </span>
  )
}
