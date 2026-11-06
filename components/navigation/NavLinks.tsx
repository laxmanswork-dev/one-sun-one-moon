'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface NavItem {
  href: string
  label: string
}

export function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
}

/** Navigation list that marks the current section with aria-current. */
export function NavLinks({
  items,
  className,
  linkClassName,
  onNavigate,
}: {
  items: readonly NavItem[]
  className?: string
  linkClassName?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={linkClassName}
            aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
