import { forwardRef, type ComponentProps } from 'react';
import { Button as ShadcnButton } from './ui/button.js';
import { cn } from '../lib/cn.js';

/** Enterprise policy layer over the generated shadcn Button source. */
export interface ButtonProps extends Omit<ComponentProps<typeof ShadcnButton>, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  /**
   * Enterprise sizing plus the icon-only sizes supplied by the underlying
   * primitive. Keeping these in the policy layer lets shared layouts use the
   * same Button export as product screens.
   */
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg' | 'icon-xs';
  loading?: boolean;
  fullWidth?: boolean;
}
const variantMap = { primary: 'default', secondary: 'secondary', tertiary: 'outline', danger: 'destructive', ghost: 'ghost' } as const;
const sizeMap = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
  icon: 'icon',
  'icon-xs': 'icon-xs',
  'icon-sm': 'icon-sm',
  'icon-lg': 'icon-lg',
} as const;
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', size = 'md', loading, fullWidth, disabled, children, ...props }, ref) => <ShadcnButton ref={ref} variant={variantMap[variant]} size={sizeMap[size]} className={cn(fullWidth && 'w-full', className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"/>}{children}</ShadcnButton>);
Button.displayName = 'EnterpriseButton';
export const IconButton = Button;
