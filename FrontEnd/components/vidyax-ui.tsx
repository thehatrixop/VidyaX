'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   VidyaX Design System — Shared Components
   ═══════════════════════════════════════════════════════════════ */

// ── Aurora Background ──────────────────────────────────────────
export function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden>
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />
      <div className="aurora-orb aurora-orb-3" />
      <div className="grid-pattern absolute inset-0" />
    </div>
  )
}

// ── Glass Card ─────────────────────────────────────────────────
interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  delay?: number
  onClick?: () => void
}

export function GlassCard({ children, className = '', hover = true, delay = 0, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.25 } } : undefined}
      onClick={onClick}
      className={`glass-card ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ── Gradient Button ────────────────────────────────────────────
interface GradientButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function GradientButton({
  children,
  onClick,
  disabled = false,
  className = '',
  size = 'md',
}: GradientButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${sizeClasses[size]} ${className}`}
    >
      {children}
    </motion.button>
  )
}

// ── Ghost Button ───────────────────────────────────────────────
interface GhostButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function GhostButton({ children, onClick, className = '' }: GhostButtonProps) {
  return (
    <motion.button
      whileHover={{ x: -3 }}
      whileTap={{ x: 0 }}
      onClick={onClick}
      className={`btn-ghost ${className}`}
    >
      {children}
    </motion.button>
  )
}

// ── Section Heading ────────────────────────────────────────────
interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ title, subtitle, align = 'left', className = '' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`space-y-3 ${align === 'center' ? 'text-center' : ''} ${className}`}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-vx-text">
        {title}
      </h2>
      {subtitle && (
        <p className="text-vx-text-secondary text-base md:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

// ── Loading Spinner ────────────────────────────────────────────
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <Loader2 className={`animate-spin text-vx-purple ${sizeClasses[size]} ${className}`} />
  )
}

// ── Skeleton Loader ────────────────────────────────────────────
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />
}

// ── Step Progress ──────────────────────────────────────────────
interface StepProgressProps {
  steps: string[]
  currentStep: number
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isComplete = index < currentStep
        const isCurrent = index === currentStep
        const isPending = index > currentStep

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="flex items-center gap-4"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                isComplete
                  ? 'bg-vx-emerald text-white shadow-lg'
                  : isCurrent
                  ? 'bg-vx-purple text-white shadow-lg shadow-vx-purple/30 animate-glow-pulse'
                  : 'bg-vx-graphite text-vx-muted border border-vx-border'
              }`}
            >
              {isComplete ? '✓' : index + 1}
            </div>
            <span
              className={`text-sm font-medium transition-colors duration-300 ${
                isComplete
                  ? 'text-vx-emerald'
                  : isCurrent
                  ? 'text-vx-text'
                  : 'text-vx-muted'
              }`}
            >
              {step}
            </span>
            {isCurrent && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-vx-purple"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// ── AI Badge ───────────────────────────────────────────────────
interface AIBadgeProps {
  label?: string
  className?: string
}

export function AIBadge({ label = 'AI Powered', className = '' }: AIBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-vx-purple/10 text-vx-purple border border-vx-purple/20 ${className}`}>
      <Sparkles className="w-3 h-3" />
      {label}
    </span>
  )
}

// ── Stat Card ──────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  accent?: 'purple' | 'blue' | 'cyan' | 'emerald'
}

export function StatCard({ label, value, icon, accent = 'purple' }: StatCardProps) {
  const accentColors = {
    purple: 'text-vx-purple',
    blue: 'text-vx-blue',
    cyan: 'text-vx-cyan',
    emerald: 'text-vx-emerald',
  }

  return (
    <div className="glass-card p-5 text-center">
      {icon && <div className={`${accentColors[accent]} mb-2 flex justify-center`}>{icon}</div>}
      <p className="text-vx-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accentColors[accent]}`}>{value}</p>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-vx-surface border border-vx-border flex items-center justify-center text-vx-muted mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-vx-text mb-2">{title}</h3>
      <p className="text-sm text-vx-muted max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  )
}

// ── Feature Tag ────────────────────────────────────────────────
interface FeatureTagProps {
  label: string
  color?: 'purple' | 'blue' | 'cyan' | 'emerald'
}

export function FeatureTag({ label, color = 'purple' }: FeatureTagProps) {
  const colorClasses = {
    purple: 'bg-vx-purple/10 text-vx-purple border-vx-purple/20',
    blue: 'bg-vx-blue/10 text-vx-blue border-vx-blue/20',
    cyan: 'bg-vx-cyan/10 text-vx-cyan border-vx-cyan/20',
    emerald: 'bg-vx-emerald/10 text-vx-emerald border-vx-emerald/20',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${colorClasses[color]}`}>
      {label}
    </span>
  )
}

// ── VidyaX Logo ────────────────────────────────────────────────
interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function VidyaXLogo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-black bg-gradient-to-br from-vx-purple to-vx-blue text-white shadow-lg shadow-vx-purple/20`}
      >
        Vx
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold tracking-tight gradient-text leading-none`}>
            VidyaX
          </span>
          <span className="text-[8px] sm:text-[9px] text-vx-muted font-bold tracking-wider uppercase mt-0.5">
            For GATE Students
          </span>
        </div>
      )}
    </div>
  )
}

// ── Page Container ─────────────────────────────────────────────
interface PageContainerProps {
  children: React.ReactNode
  className?: string
  showAurora?: boolean
}

export function PageContainer({ children, className = '', showAurora = true }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-vx-black text-vx-text relative overflow-hidden ${className}`}>
      {showAurora && <AuroraBackground />}
      <div className="noise-texture relative z-10">
        {children}
      </div>
    </div>
  )
}
