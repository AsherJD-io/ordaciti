import React from 'react'

interface MetadataRowProps {
  label: string
  value: React.ReactNode
  valueClassName?: string
  className?: string
  href?: string
}

export function MetadataRow({ label, value, valueClassName = '', className = '', href }: MetadataRowProps) {
  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={['text-sm text-primary hover:underline', valueClassName].join(' ')}
    >
      {value}
    </a>
  ) : (
    <span className={[valueClassName, typeof value === 'string' && !value ? 'text-muted-foreground/60' : ''].join(' ')}>
      {value}
    </span>
  )

  return (
    <div className={[className, 'flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-b-0'].join(' ')}>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">{label}</span>
      <div className={['text-sm', typeof value === 'string' && !value ? 'text-muted-foreground/60' : ''].join(' ')}>
        {content}
      </div>
    </div>
  )
}
