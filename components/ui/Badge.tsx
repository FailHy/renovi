// FILE: components/ui/Badge.tsx
// ========================================
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'info', children, className }: BadgeProps) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  }

  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  )
}
