'use client'

import React, { useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, AlertTriangle, Loader2 } from 'lucide-react'
import { AuroraBackground, StepProgress, GradientButton, VidyaXLogo } from '@/components/vidyax-ui'
import { getApiUrl } from '@/lib/utils'

const STEPS = [
  'Connecting to AI Engine',
  'Analyzing Topics',
  'Generating Questions',
  'Building Solutions',
  'Formatting Paper',
]

export default function GeneratingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const subjectId = params.subjectId as string
  const topics = searchParams.get('topics') || ''
  const challenge = searchParams.get('challenge') || 'practice'
  const questionCount = parseInt(searchParams.get('questions') || '10', 10)
  
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isComplete, setIsComplete] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [retrying, setRetrying] = React.useState(false)
  const hasInitiated = useRef(false)

  const generatePaper = async () => {
    setError(null)
    setCurrentStep(0)

    // Simulated step progression for UX
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length - 2) return prev + 1
        return prev
      })
    }, 2500)

    try {
      const response = await fetch(getApiUrl('/api/v1/generate-paper'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: subjectId,
          topics: topics.split(','),
          challenge,
          question_count: questionCount,
        }),
      })

      clearInterval(stepInterval)

      if (!response.ok) {
        throw new Error('Paper generation failed. Please try again.')
      }

      const data = await response.json()

      // Store to localStorage (same as before)
      localStorage.setItem('paperData', JSON.stringify(data))

      setCurrentStep(STEPS.length - 1)
      setIsComplete(true)

      setTimeout(() => {
        router.push(`/success/${subjectId}`)
      }, 1800)
    } catch (err: any) {
      clearInterval(stepInterval)
      console.error(err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
    }
  }

  useEffect(() => {
    if (!hasInitiated.current) {
      hasInitiated.current = true
      generatePaper()
    }
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    hasInitiated.current = false
    generatePaper()
    setTimeout(() => setRetrying(false), 500)
  }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-hidden flex items-center justify-center">
      <AuroraBackground />

      <div className="relative z-10 max-w-md mx-auto px-6 text-center space-y-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-vx-purple to-vx-blue flex items-center justify-center shadow-lg shadow-vx-purple/30 relative">
            <Sparkles className="w-8 h-8 text-white" />
            {!isComplete && !error && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-vx-purple/40"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            {isComplete ? (
              <span className="gradient-text">Paper Ready!</span>
            ) : error ? (
              <span className="text-red-400">Generation Failed</span>
            ) : (
              <>Generating your paper</>
            )}
          </h1>
          <p className="text-sm text-vx-text-secondary">
            {isComplete
              ? 'Your AI-generated practice paper is ready. Redirecting...'
              : error
              ? 'Something went wrong during generation.'
              : `AI is crafting ${questionCount} questions from your selected topics.`
            }
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card p-4 text-left flex items-start gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <GradientButton onClick={handleRetry} disabled={retrying}>
                {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Try Again'}
              </GradientButton>
              <button
                onClick={() => router.push(`/difficulty/${subjectId}?topics=${encodeURIComponent(topics)}`)}
                className="btn-ghost"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        )}

        {/* Step Progress */}
        {!error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <StepProgress steps={STEPS} currentStep={isComplete ? STEPS.length : currentStep} />
          </motion.div>
        )}

        {/* Loading bar */}
        {!error && !isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full"
          >
            <div className="h-1 bg-vx-graphite rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-vx-purple via-vx-blue to-vx-cyan"
                initial={{ width: '0%' }}
                animate={{ width: isComplete ? '100%' : '85%' }}
                transition={{ duration: 12, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Completion checkmark */}
        {isComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-vx-emerald/10 border-2 border-vx-emerald flex items-center justify-center mx-auto text-vx-emerald"
          >
            <span className="text-2xl">✓</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
