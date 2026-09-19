import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface BreadcrumbProps {
  href?: string
  label: string
  className?: string
}

export function Breadcrumb({ href, label, className = '' }: BreadcrumbProps) {
  return (
    <div className={['inline-flex items-center gap-1.5 text-sm text-muted-foreground', className].join(' ')}>
      {href ? (
        <Link href={href} className="inline-flex items-center hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="ml-1">{label}</span>
        </Link>
      ) : (
        <span className="text-muted-foreground/50">{label}</span>
      )}
    </div>
  )
}
