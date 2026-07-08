'use client'

import React, { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import { PageHeader } from '@/components/navigation'
import { AuroraBackground, GradientButton, SectionHeading, GlassCard, LoadingSpinner } from '@/components/vidyax-ui'
import { getApiUrl } from '@/lib/utils'

export default function TopicsPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.subjectId as string
  const [subject, setSubject] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedTopics, setSelectedTopics] = React.useState<Set<string>>(new Set())
  const [isNavigating, setIsNavigating] = React.useState(false)

  React.useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await fetch(
          getApiUrl(`/api/v1/topics/by-slug/${subjectId}`)
        )

        const data = await response.json()

        setSubject({
          id: subjectId,
          name: data.name,
          chapters: data.topics.map((t: any) => t.name)
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadTopics()
  }, [subjectId])

  if (loading) {
    return (
      <div className="min-h-screen bg-vx-black text-vx-text flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-vx-muted text-sm">Loading topics...</p>
        </div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-vx-black text-vx-text flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-vx-muted text-lg">Subject not found</p>
          <button onClick={() => router.push('/subjects')} className="btn-secondary">
            Back to Subjects
          </button>
        </div>
      </div>
    )
  }

  const handleTopicToggle = (topic: string) => {
    const newSelected = new Set(selectedTopics)
    if (newSelected.has(topic)) {
      newSelected.delete(topic)
    } else {
      newSelected.add(topic)
    }
    setSelectedTopics(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTopics.size === subject.chapters.length) {
      setSelectedTopics(new Set())
    } else {
      setSelectedTopics(new Set(subject.chapters))
    }
  }

  const handleContinue = () => {
    if (selectedTopics.size === 0) return
    setIsNavigating(true)
    setTimeout(() => {
      router.push(
        `/difficulty/${subjectId}?topics=${encodeURIComponent(Array.from(selectedTopics).join(','))}`
      )
    }, 400)
  }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-hidden">
      <AuroraBackground />
      <PageHeader backLabel={subject.name} backHref="/subjects" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <SectionHeading
          title="Select Topics"
          subtitle={
            selectedTopics.size > 0
              ? `${selectedTopics.size} topic${selectedTopics.size !== 1 ? 's' : ''} selected`
              : 'Select at least one topic to continue'
          }
        />

        {/* Select All / Clear */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 mb-8 flex items-center gap-3"
        >
          <button
            onClick={handleSelectAll}
            className="btn-secondary text-xs px-4 py-2"
          >
            {selectedTopics.size === subject.chapters.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs text-vx-muted">
            {subject.chapters.length} topics available
          </span>
        </motion.div>

        {/* Topic Pills Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10"
        >
          {subject.chapters.map((chapter: string, index: number) => {
            const isSelected = selectedTopics.has(chapter)
            return (
              <motion.button
                key={chapter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTopicToggle(chapter)}
                className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-vx-purple/10 border-vx-purple/40 text-vx-text shadow-lg shadow-vx-purple/5'
                    : 'bg-vx-graphite/50 border-vx-border/40 text-vx-text-secondary hover:border-vx-purple/30 hover:bg-vx-graphite/70'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{chapter}</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-vx-purple text-white'
                      : 'bg-vx-surface border border-vx-border'
                  }`}>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-bold"
                      >
                        ✓
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Selected Topics Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <h3 className="text-sm font-semibold text-vx-muted mb-3">Selected Topics</h3>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            <AnimatePresence>
              {selectedTopics.size === 0 ? (
                <p className="text-vx-muted text-sm italic">Select topics to begin</p>
              ) : (
                Array.from(selectedTopics).map((topic) => (
                  <motion.button
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleTopicToggle(topic)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vx-purple/10 text-vx-purple border border-vx-purple/20 text-xs font-medium hover:bg-vx-purple/20 transition-colors"
                  >
                    {topic}
                    <X className="w-3 h-3" />
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-8 border-t border-vx-border/30"
        >
          <button
            onClick={() => router.push('/subjects')}
            className="btn-ghost"
          >
            ← Back to Subjects
          </button>

          <GradientButton
            onClick={handleContinue}
            disabled={selectedTopics.size === 0 || isNavigating}
          >
            Configure Difficulty
            <ChevronRight className="w-4 h-4" />
          </GradientButton>
        </motion.div>
      </div>
    </div>
  )
}
