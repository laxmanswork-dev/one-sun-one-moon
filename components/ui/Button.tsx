import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'light' | 'ghostLight'

export function Arrow({ className }: { className?: string }) {
  return (
    <svg className={[styles.arrow, className].filter(Boolean).join(' ')} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M3 10h13M11 4.5 16.5 10 11 15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function buttonClass(variant: Variant = 'primary', size: 'md' | 'sm' = 'md', extra?: string) {
  return [styles.button, variant !== 'primary' && styles[variant], size === 'sm' && styles.small, extra]
    .filter(Boolean)
    .join(' ')
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  variant?: Variant
  size?: 'md' | 'sm'
  arrow?: boolean
  className?: string
  children: ReactNode
}

export function ButtonLink({ variant, size, arrow, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  )
}

export function TextLink({ children, className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={[styles.textLink, className].filter(Boolean).join(' ')} {...props}>
      {children}
      <Arrow />
    </Link>
  )
}
