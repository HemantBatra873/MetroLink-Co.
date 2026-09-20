import { cn } from 'cn'
import { Badge, badgeVariants } from './ui/badge.js'
import type { VariantProps } from 'class-variance-authority'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export type StatusBadgeProps = {
  /** Raw status code such as Succeeded, Pending, Payable. */
  status: string
  variant?: BadgeVariant
  className?: string
}

/**
 * Domain-agnostic status chip. Apps map their status enums to Badge variants.
 */
function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  const label = status.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
  return (
    <Badge variant={variant} className={cn('font-medium capitalize', className)}>
      {label}
    </Badge>
  )
}

export { StatusBadge }
