'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Clock,
  ListTodo,
  Tv,
  PenTool,
  Sparkles,
  ChevronLeft,
  Menu,
  X,
  Home,
  FileText,
  Crown,
} from 'lucide-react'
import { VidyaXLogo } from './vidyax-ui'

const NAV_LINKS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Practice Papers', href: '/subjects', icon: FileText },
  { name: 'Focus Mode', href: '/features/focus-dojo', icon: Clock },
  { name: 'Study Planner', href: '/features/task-quest', icon: ListTodo },
  { name: 'Writing Lab', href: '/features/scribe-dojo', icon: PenTool },
  { name: 'Video Library', href: '/features/concept-dojo', icon: Tv },
]

// ── Top Navigation Bar ────────────────────────────────────────
export function TopNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <VidyaXLogo size="md" />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="flex items-center bg-vx-graphite/50 rounded-xl px-1 py-1 border border-vx-border/40">
              {NAV_LINKS.slice(1).map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'text-vx-text bg-vx-surface'
                        : 'text-vx-text-secondary hover:text-vx-text hover:bg-vx-surface/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-vx-surface rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* CTA + Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-vx-purple/15 text-vx-purple border border-vx-purple/30 hover:bg-vx-purple/25 transition-all flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 animate-pulse" />
                Upgrade to Pro
              </motion.button>
            </Link>

            <Link href="/subjects" className="hidden lg:block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary text-[13px] px-5 py-2.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Paper
              </motion.button>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-vx-text-secondary hover:text-vx-text rounded-lg hover:bg-vx-surface/50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden border-t border-white/[0.04] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-vx-text bg-vx-surface'
                        : 'text-vx-text-secondary hover:text-vx-text hover:bg-vx-surface/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                )
              })}
              <div className="pt-3 mt-2 border-t border-vx-border/40 space-y-2">
                <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block">
                  <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-vx-purple/15 text-vx-purple border border-vx-purple/30 hover:bg-vx-purple/25 transition-all">
                    <Crown className="w-4 h-4 animate-pulse" />
                    Upgrade to Pro
                  </button>
                </Link>
                <Link href="/subjects" onClick={() => setMobileOpen(false)} className="block">
                  <button className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Paper
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// ── Back Navigation ───────────────────────────────────────────
interface BackNavProps {
  label?: string
  href?: string
  onClick?: () => void
}

export function BackNav({ label = 'Back', href, onClick }: BackNavProps) {
  const content = (
    <motion.div
      whileHover={{ x: -3 }}
      className="flex items-center gap-2 text-vx-text-secondary hover:text-vx-text transition-colors cursor-pointer"
    >
      <ChevronLeft className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return <button onClick={onClick}>{content}</button>
}

// ── Page Header (used on inner pages) ─────────────────────────
interface PageHeaderProps {
  backLabel?: string
  backHref?: string
  onBack?: () => void
  rightContent?: React.ReactNode
}

export function PageHeader({ backLabel, backHref, onBack, rightContent }: PageHeaderProps) {
  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/">
              <VidyaXLogo size="sm" showText={false} />
            </Link>
            {(backLabel || onBack) && (
              <>
                <div className="w-px h-6 bg-vx-border/40" />
                <BackNav
                  label={backLabel}
                  href={backHref}
                  onClick={onBack}
                />
              </>
            )}
          </div>
          {rightContent && <div className="flex items-center gap-3">{rightContent}</div>}
        </div>
      </div>
    </nav>
  )
}
