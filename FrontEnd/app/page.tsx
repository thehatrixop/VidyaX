'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Sparkles,
  Clock,
  ListTodo,
  PenTool,
  Tv,
  Zap,
  BookOpen,
  Brain,
  FileText,
  ArrowRight,
  Star,
  Users,
  BarChart3,
} from 'lucide-react'
import { TopNav } from '@/components/navigation'
import { AuroraBackground, GlassCard, GradientButton, VidyaXLogo, AIBadge } from '@/components/vidyax-ui'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
}

const FEATURES = [
  {
    id: 1,
    title: 'Focus Mode',
    description: 'Pomodoro-powered study sessions with smart break scheduling to build deep focus habits.',
    link: '/features/focus-dojo',
    icon: Clock,
    color: 'purple' as const,
    badge: 'Productivity',
  },
  {
    id: 2,
    title: 'Study Planner',
    description: 'Interactive Kanban board to organize your study goals, schedule reminders, and track progress.',
    link: '/features/task-quest',
    icon: ListTodo,
    color: 'blue' as const,
    badge: 'Organization',
  },
  {
    id: 3,
    title: 'Writing Lab',
    description: 'Submit drafts for AI-powered grammar analysis, corrections, rule explanations, and coaching.',
    link: '/features/scribe-dojo',
    icon: PenTool,
    color: 'emerald' as const,
    badge: 'AI Writing Coach',
  },
  {
    id: 4,
    title: 'Video Library',
    description: 'Search CS topics to discover AI-curated educational videos, ranked by relevance and quality.',
    link: '/features/concept-dojo',
    icon: Tv,
    color: 'cyan' as const,
    badge: 'AI Curated',
  },
]

const STEPS = [
  { title: 'Choose GATE Subject', description: 'Select from 13 GATE CS syllabus subjects', icon: BookOpen },
  { title: 'Pick Topics', description: 'Choose chapters you\'ve studied', icon: Brain },
  { title: 'Set GATE Difficulty', description: 'Configure your challenge level', icon: BarChart3 },
  { title: 'Get Practice Paper', description: 'AI generates GATE-level questions with solutions', icon: FileText },
]

const STATS = [
  { label: 'GATE CS Subjects', value: '13', icon: BookOpen },
  { label: 'Syllabus Topics', value: '125+', icon: Brain },
  { label: 'AI Tools', value: '6', icon: Sparkles },
  { label: 'Practice Questions', value: '∞', icon: Zap },
]

export default function LandingPage() {
  const handleCTAClick = () => {
    window.location.href = '/subjects'
  }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text overflow-hidden relative">
      <AuroraBackground />

      {/* Navigation */}
      <TopNav />

      {/* ══════ Hero Section ══════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <motion.div variants={itemVariants}>
            <AIBadge label="AI-Powered Chatbot & Practice for GATE Students" />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            <span className="gradient-text">Jo Padho,</span>
            <br />
            <span className="text-vx-text">Wo Yaad Rahe.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-vx-text-secondary max-w-xl mx-auto leading-relaxed"
          >
            Generate personalized, GATE-standard practice papers with AI. Select your topics, choose difficulty, and download instantly — with full step-by-step solutions.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <GradientButton onClick={handleCTAClick} size="lg">
              Start Practicing
              <ChevronRight className="w-5 h-5" />
            </GradientButton>
            <Link href="#features">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-glass px-8 py-4 text-base"
              >
                Explore Features
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-6 text-sm text-vx-muted pt-4"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-vx-purple" />
              AI-Powered
            </span>
            <span className="w-1 h-1 rounded-full bg-vx-border" />
            <span>Instant PDFs</span>
            <span className="w-1 h-1 rounded-full bg-vx-border" />
            <span>No signup required</span>
          </motion.div>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-32 left-10 w-20 h-20 rounded-full border border-vx-purple/20 opacity-40"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 rounded-full border border-vx-cyan/10 opacity-30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </section>

      {/* ══════ Stats Section ══════ */}
      <section className="relative z-10 border-t border-vx-border/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-vx-surface border border-vx-border flex items-center justify-center mx-auto mb-3 text-vx-purple">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-vx-muted mt-1 font-medium">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════ Features Section ══════ */}
      <section id="features" className="relative z-10 border-t border-vx-border/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Everything you need to <span className="gradient-text">study smarter</span>
            </h2>
            <p className="text-vx-text-secondary text-lg">
              A complete AI-powered toolkit designed for focused, efficient learning.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              const colorClasses = {
                purple: 'from-vx-purple/20 to-transparent text-vx-purple border-vx-purple/20',
                blue: 'from-vx-blue/20 to-transparent text-vx-blue border-vx-blue/20',
                cyan: 'from-vx-cyan/20 to-transparent text-vx-cyan border-vx-cyan/20',
                emerald: 'from-vx-emerald/20 to-transparent text-vx-emerald border-vx-emerald/20',
              }
              const iconBg = {
                purple: 'bg-vx-purple/10 text-vx-purple',
                blue: 'bg-vx-blue/10 text-vx-blue',
                cyan: 'bg-vx-cyan/10 text-vx-cyan',
                emerald: 'bg-vx-emerald/10 text-vx-emerald',
              }

              return (
                <Link key={feature.id} href={feature.link}>
                  <GlassCard
                    delay={index * 0.1}
                    className="p-7 h-full group cursor-pointer relative overflow-hidden"
                  >
                    {/* Gradient background accent */}
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${colorClasses[feature.color]} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl ${iconBg[feature.color]} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${colorClasses[feature.color]} bg-gradient-to-r`}>
                          {feature.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-vx-text group-hover:text-white transition-colors mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-vx-text-secondary leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-vx-muted group-hover:text-vx-text transition-colors pt-2">
                        <span>Open</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════ How It Works Section ══════ */}
      <section className="relative z-10 border-t border-vx-border/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Practice papers in <span className="gradient-text">4 simple steps</span>
            </h2>
            <p className="text-vx-text-secondary text-lg">
              From subject selection to downloadable PDF in under a minute.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                >
                  <GlassCard className="p-6 text-center h-full" hover={false}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vx-purple/20 to-vx-blue/10 border border-vx-purple/20 flex items-center justify-center mx-auto mb-4 text-vx-purple">
                      <span className="text-lg font-bold">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-vx-text-secondary leading-relaxed">{step.description}</p>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>

          {/* Connection line */}
          <div className="hidden md:block mt-10">
            <svg className="w-full h-12 opacity-20" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path
                d="M 50 20 Q 250 5 450 20 T 850 20"
                stroke="url(#lineGrad)"
                strokeWidth="2"
                fill="none"
              />
              {[0, 33, 66, 100].map((x) => (
                <circle
                  key={x}
                  cx={`${x}%`}
                  cy="20"
                  r="4"
                  fill="#8b5cf6"
                />
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* ══════ CTA Section ══════ */}
      <section className="relative z-10 border-t border-vx-border/30 py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vx-purple to-vx-blue flex items-center justify-center mx-auto shadow-lg shadow-vx-purple/20">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to ace your exams?
            </h2>
            <p className="text-vx-text-secondary text-lg max-w-lg mx-auto">
              Start generating personalized practice papers right now. No account needed — just select, generate, and study.
            </p>

            <GradientButton onClick={handleCTAClick} size="lg">
              Start Your First Paper
              <ChevronRight className="w-5 h-5" />
            </GradientButton>

            <p className="text-vx-muted text-sm">
              No signup required. Start generating papers instantly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════ Footer ══════ */}
      <footer className="relative z-10 border-t border-vx-border/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <VidyaXLogo size="sm" />
            <p className="text-xs text-vx-muted">
              Jo Padho, Wo Yaad Rahe. — AI-Powered Learning Platform
            </p>
            <div className="flex items-center gap-6">
              {[
                { name: 'Practice', href: '/subjects' },
                { name: 'Focus', href: '/features/focus-dojo' },
                { name: 'Planner', href: '/features/task-quest' },
                { name: 'Writing', href: '/features/scribe-dojo' },
                { name: 'Videos', href: '/features/concept-dojo' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-vx-muted hover:text-vx-text transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
