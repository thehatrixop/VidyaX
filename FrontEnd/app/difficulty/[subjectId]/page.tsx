'use client'

import React from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Shield, Swords, Trophy, Crown, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/navigation'
import { AuroraBackground, GradientButton, SectionHeading, GlassCard, AIBadge } from '@/components/vidyax-ui'

interface Challenge {
  id: string
  label: string
  description: string
  icon: any
  questionCount: number
  color: string
  gradient: string
  accentBorder: string
}

const CHALLENGES: Challenge[] = [
  {
    id: 'rookie',
    label: 'Rookie',
    description: 'Basic GATE concepts. Perfect for early foundation and building initial speed.',
    icon: Shield,
    questionCount: 5,
    color: 'text-vx-emerald',
    gradient: 'from-vx-emerald/15 to-transparent',
    accentBorder: 'border-vx-emerald/30',
  },
  {
    id: 'practice',
    label: 'Practice',
    description: 'Standard moderate problems. Great for daily GATE practice sessions.',
    icon: Swords,
    questionCount: 10,
    color: 'text-vx-blue',
    gradient: 'from-vx-blue/15 to-transparent',
    accentBorder: 'border-vx-blue/30',
  },
  {
    id: 'competitive',
    label: 'Competitive',
    description: 'GATE exam-level questions. Highly standard patterns to test concepts.',
    icon: Trophy,
    questionCount: 15,
    color: 'text-vx-purple',
    gradient: 'from-vx-purple/15 to-transparent',
    accentBorder: 'border-vx-purple/30',
  },
  {
    id: 'topper',
    label: 'Topper',
    description: 'AIR < 100 level challenges. Tough, analytical questions for advanced ranks.',
    icon: Crown,
    questionCount: 20,
    color: 'text-yellow-500',
    gradient: 'from-yellow-500/15 to-transparent',
    accentBorder: 'border-yellow-500/30',
  },
]

export default function DifficultyPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const subjectId = params.subjectId as string
  const topics = searchParams.get('topics') || ''
  const [selectedChallenge, setSelectedChallenge] = React.useState<string | null>(null)
  const [isNavigating, setIsNavigating] = React.useState(false)

  const handleSelectChallenge = (challenge: Challenge) => {
    if (challenge.id === 'competitive' || challenge.id === 'topper') {
      const hasPro = typeof window !== 'undefined' && localStorage.getItem('vx_license_key')?.startsWith('vx_')
      if (!hasPro) {
        router.push('/pricing')
        return
      }
    }
    setSelectedChallenge(challenge.id)
  }

  const handleContinue = () => {
    if (!selectedChallenge) return
    const challenge = CHALLENGES.find(c => c.id === selectedChallenge)
    if (!challenge) return
    setIsNavigating(true)
    setTimeout(() => {
      router.push(
        `/generating/${subjectId}?topics=${encodeURIComponent(topics)}&challenge=${challenge.id}&questions=${challenge.questionCount}`
      )
    }, 400)
  }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-hidden">
      <AuroraBackground />
      <PageHeader backLabel="Topics" backHref={`/topics/${subjectId}`} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <SectionHeading
          title="Choose Difficulty"
          subtitle="Select how challenging you want your practice paper to be."
        />

        {/* Difficulty Meter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 mb-10 flex items-center gap-2 max-w-md"
        >
          {CHALLENGES.map((c, i) => {
            const isSelected = selectedChallenge === c.id
            const isBeforeSelected = selectedChallenge ? CHALLENGES.findIndex(ch => ch.id === selectedChallenge) >= i : false
            return (
              <div
                key={c.id}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  isSelected ? 'bg-vx-purple shadow-lg shadow-vx-purple/30' :
                  isBeforeSelected ? 'bg-vx-purple/50' :
                  'bg-vx-surface'
                }`}
              />
            )
          })}
        </motion.div>

        {/* Challenge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CHALLENGES.map((challenge, index) => {
            const Icon = challenge.icon
            const isSelected = selectedChallenge === challenge.id

            return (
              <motion.button
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectChallenge(challenge)}
                className="text-left relative group"
              >
                {isSelected && (
                  <motion.div
                    layoutId="selectedChallenge"
                    className={`absolute inset-0 rounded-xl border-2 ${challenge.accentBorder} z-20`}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                  />
                )}

                <GlassCard className="p-6 h-full relative overflow-hidden" delay={0}>
                  {/* Background gradient accent */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${challenge.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-vx-surface border border-vx-border flex items-center justify-center ${challenge.color} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        {(challenge.id === 'competitive' || challenge.id === 'topper') && (
                          <span className="text-[10px] font-bold text-vx-purple bg-vx-purple/10 border border-vx-purple/35 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Crown className="w-3 h-3 text-vx-purple animate-pulse" />
                            PRO
                          </span>
                        )}
                        <span className="text-xs font-bold text-vx-muted bg-vx-surface border border-vx-border px-3 py-1 rounded-full">
                          {challenge.questionCount} questions
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-xl font-bold transition-colors ${isSelected ? challenge.color : 'text-vx-text group-hover:text-white'}`}>
                        {challenge.label}
                      </h3>
                      <p className="text-sm text-vx-text-secondary leading-relaxed mt-2">
                        {challenge.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.button>
            )
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-10 mt-10 border-t border-vx-border/30"
        >
          <button
            onClick={() => router.push(`/topics/${subjectId}`)}
            className="btn-ghost"
          >
            ← Back to Topics
          </button>

          <GradientButton
            onClick={handleContinue}
            disabled={!selectedChallenge || isNavigating}
          >
            <Sparkles className="w-4 h-4" />
            Generate Paper
            <ChevronRight className="w-4 h-4" />
          </GradientButton>
        </motion.div>
      </div>
    </div>
  )
}
