import { Link, useLocation } from 'react-router-dom'

export interface SubNavItem {
  label: string
  path: string
  end?: boolean
}

export function ModuleSubNav({ items }: { items: SubNavItem[] }) {
  const location = useLocation()

  const isActive = (item: SubNavItem) => {
    if (item.end) return location.pathname === item.path
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  }

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={
            isActive(item)
              ? 'rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground'
              : 'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
