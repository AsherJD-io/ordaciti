import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  interactive?: boolean
  onClick?: () => void
  elevated?: boolean
}

export function Card({ children, className = '', hover = false, interactive = false, onClick, elevated = false }: CardProps) {
  const baseClasses = 'rounded-lg border border-border bg-card text-card-foreground'
  const shadowClasses = elevated
    ? 'shadow-card'
    : ''
  const hoverClasses = hover
    ? 'transition-card hover:shadow-card-hover hover:border-primary/40 hover:-translate-y-0.5'
    : 'transition-card'
  const interactiveClasses = interactive
    ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    : ''

  return (
    <div
      className={[baseClasses, shadowClasses, hoverClasses, interactiveClasses, className].join(' ')}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={['pb-4', className].join(' ')}>{children}</div>
}

export function CardTitle({ children, className = '', as: Tag = 'h3' }: { children: React.ReactNode; className?: string; as?: keyof JSX.IntrinsicElements }) {
  return <Tag className={['text-lg font-semibold tracking-tight', className].join(' ')}>{children}</Tag>
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={['text-sm text-muted-foreground', className].join(' ')}>{children}</p>
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={['pt-4', className].join(' ')}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={['pt-4 border-t border-border', className].join(' ')}>{children}</div>
}
