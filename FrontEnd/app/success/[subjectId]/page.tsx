'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Printer,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  Sparkles,
  FileText,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'
import { PageHeader } from '@/components/navigation'
import { AuroraBackground, LoadingSpinner, GlassCard, AIBadge, GradientButton } from '@/components/vidyax-ui'
import QuestionChat from '@/components/QuestionChat'
import LatexRenderer from '@/components/LatexRenderer'

interface Question {
  id: number
  topic: string
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct_answer: string
  explanation: string
}

interface PaperData {
  subject: string
  topics: string[]
  challenge: string
  question_count: number
  questions: Question[]
}

export default function SuccessPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.subjectId as string

  const [paperData, setPaperData] = useState<PaperData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [tempAnswers, setTempAnswers] = useState<Record<number, string>>({})
  const [showAnswers, setShowAnswers] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [activeChatQuestion, setActiveChatQuestion] = useState<number | null>(null)

  // Card view state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Stopwatch (Navbar) state - completely independent user stopwatch
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [stopwatchActive, setStopwatchActive] = useState(true)

  // Individual Question Timers state
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({})

  // Fetch paper data
  useEffect(() => {
    const stored = localStorage.getItem('paperData')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setPaperData(data)
      } catch (e) {
        console.error('Failed to parse paper data', e)
      }
    }
    setLoading(false)
  }, [])

  // Navbar Stopwatch ticking logic (Manual, user-controlled)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (stopwatchActive) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [stopwatchActive])

  // Active question ID derived from current index
  const activeQuestionId = paperData?.questions?.[currentQuestionIndex]?.id || null

  // Check if active question is already answered
  const isActiveQuestionAnswered = activeQuestionId !== null && selectedAnswers[activeQuestionId] !== undefined

  // Individual Question Timer ticking logic
  // Runs for the visible question, only if it is NOT answered and answers are not shown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (activeQuestionId !== null && !showAnswers && !isActiveQuestionAnswered) {
      interval = setInterval(() => {
        setQuestionTimes(prev => ({
          ...prev,
          [activeQuestionId]: (prev[activeQuestionId] || 0) + 1
        }))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeQuestionId, showAnswers, isActiveQuestionAnswered])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleOptionClick = (questionId: number, option: string) => {
    setTempAnswers(prev => ({ ...prev, [questionId]: option }))
  }

  const handleOptionSubmit = (questionId: number) => {
    const tempOption = tempAnswers[questionId]
    if (tempOption) {
      setSelectedAnswers(prev => ({ ...prev, [questionId]: tempOption }))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleExpand = (questionId: number) => {
    setExpandedQuestion(prev => prev === questionId ? null : questionId)
  }

  const toggleChat = (questionId: number) => {
    setActiveChatQuestion(prev => prev === questionId ? null : questionId)
  }

  // Stats
  const totalQuestions = paperData?.questions?.length || 0
  const answered = Object.keys(selectedAnswers).length
  const correct = paperData?.questions?.filter(q => selectedAnswers[q.id] === q.correct_answer).length || 0

  // Overall Test Timer: Sum of all individual question times
  const totalTestTime = paperData?.questions?.reduce((acc, q) => acc + (questionTimes[q.id] || 0), 0) || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-vx-black text-vx-text flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!paperData) {
    return (
      <div className="min-h-screen bg-vx-black text-vx-text flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="w-12 h-12 text-vx-muted mx-auto" />
          <p className="text-vx-muted text-lg">No paper data found</p>
          <button onClick={() => router.push('/subjects')} className="btn-primary">
            Generate New Paper
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-hidden">
      <AuroraBackground />

      {/* Navigation Header */}
      <div className="print:hidden">
        <PageHeader
          backLabel="New Paper"
          backHref="/subjects"
          rightContent={
            <div className="flex items-center gap-3">
              {/* Stopwatch */}
              <div className="flex items-center gap-1.5 glass px-2.5 py-1.5 rounded-lg border border-vx-border/45 select-none">
                <button
                  onClick={() => setStopwatchActive(!stopwatchActive)}
                  className="text-vx-text-secondary hover:text-vx-text p-0.5 rounded transition-colors"
                  title={stopwatchActive ? "Pause Stopwatch" : "Start Stopwatch"}
                >
                  {stopwatchActive ? (
                    <Pause className="w-3.5 h-3.5 text-vx-purple" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
                
                <span className="text-xs font-mono font-semibold text-vx-text min-w-[38px] text-center">
                  {formatTime(stopwatchTime)}
                </span>
                
                <button
                  onClick={() => {
                    setStopwatchTime(0)
                    setStopwatchActive(false)
                  }}
                  className="text-vx-muted hover:text-red-400 p-0.5 rounded transition-colors"
                  title="Reset Stopwatch"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggle Answers */}
              <button
                onClick={() => {
                  const nextShow = !showAnswers
                  setShowAnswers(nextShow)
                  if (nextShow) {
                    setStopwatchActive(false)
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showAnswers
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'glass text-vx-text-secondary hover:text-vx-text'
                }`}
              >
                {showAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showAnswers ? 'Hide' : 'Show'} Answers
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass text-vx-text-secondary hover:text-vx-text transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
            </div>
          }
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 print:hidden">
        {/* Paper Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AIBadge label="AI Generated" />
                <span className="text-xs text-vx-muted capitalize font-medium bg-vx-surface px-2.5 py-1 rounded-full border border-vx-border/40">
                  {paperData.challenge}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {paperData.subject}
              </h1>
              <p className="text-sm text-vx-text-secondary mt-1">
                {paperData.topics.join(' · ')}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 print:hidden">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold gradient-text">{totalQuestions}</p>
              <p className="text-xs text-vx-muted mt-1">Questions</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-vx-blue">{answered}</p>
              <p className="text-xs text-vx-muted mt-1">Answered</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className={`text-2xl font-bold ${correct === totalQuestions && answered > 0 ? 'text-emerald-400' : 'text-vx-purple'}`}>
                {showAnswers ? correct : '—'}
              </p>
              <p className="text-xs text-vx-muted mt-1">Correct</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-vx-cyan">{formatTime(totalTestTime)}</p>
              <p className="text-xs text-vx-muted mt-1">Total Time</p>
            </div>
          </div>
        </motion.div>

        {/* Question Selector / Progress Bar */}
        <div className="flex flex-col items-center gap-3 mb-8 print:hidden">
          <div className="text-xs font-semibold text-vx-muted uppercase tracking-wider">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 max-w-lg">
            {paperData.questions.map((q, idx) => {
              const isActive = idx === currentQuestionIndex
              const selectedOption = selectedAnswers[q.id]
              const isAnswered = selectedOption !== undefined
              const isCorrect = selectedOption === q.correct_answer
              
              let btnStyle = "bg-vx-graphite/40 border-vx-border/40 text-vx-muted hover:border-vx-purple/40 hover:text-vx-text"
              
              if (isActive) {
                if (isAnswered) {
                  btnStyle = isCorrect
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500"
                    : "bg-red-500/10 border-red-500/40 text-red-400 font-bold shadow-[0_0_12px_rgba(239,68,68,0.35)] ring-1 ring-red-500"
                } else {
                  btnStyle = "bg-vx-purple/10 border-vx-purple text-vx-purple font-bold shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                }
              } else if (isAnswered) {
                btnStyle = isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold"
                  : "bg-red-500/10 border-red-500/30 text-red-400 font-semibold"
              }
              
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(idx)
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs transition-all duration-300 ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Card View for Screen */}
        <div className="print:hidden min-h-[380px] relative">
          <AnimatePresence mode="wait">
            {paperData.questions.map((question, index) => {
              if (index !== currentQuestionIndex) return null

              const selectedOption = selectedAnswers[question.id]
              const tempOption = tempAnswers[question.id]
              const isCorrect = selectedOption === question.correct_answer
              const isExpanded = expandedQuestion === question.id
              const isChatOpen = activeChatQuestion === question.id
              const isCardAnswered = selectedOption !== undefined

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="question-card"
                >
                  <GlassCard
                    className="p-0 overflow-hidden ring-1 ring-vx-purple/20 border-vx-purple/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)]"
                    hover={false}
                    delay={0}
                  >
                    {/* Question Header */}
                    <div className="p-6 pb-0">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-vx-purple/10 border border-vx-purple/30 flex items-center justify-center text-xs font-bold text-vx-purple">
                            {index + 1}
                          </span>
                          <span className="text-[10px] font-semibold text-vx-muted uppercase tracking-wider bg-vx-surface px-2 py-0.5 rounded-md border border-vx-border/40">
                            {question.topic}
                          </span>

                          {/* Individual Question Timer */}
                          <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all duration-300 ${
                            isCardAnswered 
                              ? 'bg-vx-graphite/40 border-vx-border/40 text-vx-muted' 
                              : 'bg-vx-purple/10 border-vx-purple/35 text-vx-purple animate-pulse'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTime(questionTimes[question.id] || 0)}</span>
                          </div>
                        </div>

                        {selectedOption && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' }}
                          >
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                          </motion.div>
                        )}
                      </div>

                      <div className="text-base font-medium text-vx-text leading-relaxed mb-6">
                        <LatexRenderer text={question.question} />
                      </div>
                    </div>

                    {/* Options */}
                    <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(question.options).map(([key, value]) => {
                        const isSelected = selectedOption === key
                        const isCorrectAnswer = key === question.correct_answer
                        const isTempSelected = tempOption === key

                        let optionStyle = 'bg-vx-graphite/50 border-vx-border/40 text-vx-text-secondary hover:border-vx-purple/30 hover:bg-vx-graphite/70'

                        if (selectedOption !== undefined) {
                          if (isCorrectAnswer) {
                            optionStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold'
                          } else if (isSelected) {
                            optionStyle = 'bg-red-500/10 border-red-500/35 text-red-400 font-semibold'
                          } else {
                            optionStyle = 'bg-vx-graphite/30 border-vx-border/20 text-vx-text-secondary/40 cursor-not-allowed'
                          }
                        } else if (isTempSelected) {
                          optionStyle = 'bg-purple-500/20 border-purple-500 text-purple-300 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.35)]'
                        }

                        return (
                          <motion.button
                            key={key}
                            whileTap={selectedOption === undefined ? { scale: 0.98 } : {}}
                            onClick={() => {
                              if (selectedOption === undefined) {
                                handleOptionClick(question.id, key)
                              }
                            }}
                            className={`text-left px-4 py-3.5 rounded-lg border transition-all duration-200 text-sm ${optionStyle}`}
                          >
                            <span className="font-bold mr-2">{key}.</span>
                            <LatexRenderer text={value} />
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Submit Button for Double Verification */}
                    {tempOption && selectedOption === undefined && (
                      <div className="px-6 pb-6 flex justify-end">
                        <GradientButton
                          onClick={() => handleOptionSubmit(question.id)}
                          size="sm"
                        >
                          Submit Answer
                        </GradientButton>
                      </div>
                    )}

                    {/* Explanation & Chat Actions */}
                    <div className="px-6 pb-6 flex items-center gap-3 print:hidden">
                      {selectedOption !== undefined && (
                        <button
                          onClick={() => toggleExpand(question.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-vx-muted hover:text-vx-text transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          Explanation
                        </button>
                      )}
                      {selectedOption !== undefined && selectedOption !== question.correct_answer && (
                        <button
                          onClick={() => toggleChat(question.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-vx-purple hover:text-vx-text transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {isChatOpen ? 'Close AI Tutor' : 'Ask AI Tutor'}
                        </button>
                      )}
                    </div>

                    {/* Explanation Panel */}
                    <AnimatePresence>
                      {isExpanded && selectedOption !== undefined && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mx-6 mb-6 p-4 rounded-lg bg-vx-graphite/40 border border-vx-border/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-3.5 h-3.5 text-vx-purple" />
                              <span className="text-xs font-semibold text-vx-purple">Explanation</span>
                            </div>
                            <div className="text-xs text-vx-text-secondary leading-relaxed">
                              <LatexRenderer text={question.explanation} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* AI Tutor Chat */}
                    <AnimatePresence>
                      {isChatOpen && selectedOption !== undefined && selectedOption !== question.correct_answer && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden px-6 pb-6"
                        >
                          <QuestionChat question={question} selectedAnswer={selectedOption} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons for Pagination */}
        <div className="print:hidden mt-6 flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold glass text-vx-text-secondary hover:text-vx-text disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          
          <button
            onClick={() => {
              if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(prev => prev + 1)
              } else {
                setShowAnswers(true)
                setStopwatchActive(false)
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentQuestionIndex === totalQuestions - 1
                ? 'bg-gradient-to-r from-vx-purple to-vx-blue text-white shadow-lg shadow-vx-purple/20'
                : 'glass text-vx-text-secondary hover:text-vx-text'
            }`}
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Finish & Review' : 'Next →'}
          </button>
        </div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-vx-border/30 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden"
        >
          <button
            onClick={() => router.push('/subjects')}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" />
            Generate New Paper
          </button>

          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="btn-secondary text-sm">
              <Printer className="w-4 h-4" />
              Print Paper
            </button>
          </div>
        </motion.div>
      </div>

      {/* Print Header (print-only) */}
      <div className="hidden print:block text-center py-6 border-b-2 border-gray-300">
        <h1 className="text-2xl font-bold">VidyaX Practice Paper</h1>
        <p className="text-sm text-gray-600 mt-1">{paperData.subject} · {paperData.topics.join(', ')}</p>
        <p className="text-xs text-gray-500 mt-1">Challenge: {paperData.challenge} · {totalQuestions} Questions</p>
      </div>

      {/* Printable Questions List (print-only) */}
      <div className="hidden print:block space-y-6 mt-8 max-w-4xl mx-auto px-6">
        {paperData.questions.map((question, index) => {
          return (
            <div key={question.id} className="border-b border-gray-200 pb-6 break-inside-avoid">
              <div className="flex items-start gap-3 mb-3">
                <span className="font-bold text-sm text-black">{index + 1}.</span>
                <div>
                  <div className="text-sm font-medium text-black">
                    <LatexRenderer text={question.question} />
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{question.topic}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pl-6">
                {Object.entries(question.options).map(([key, value]) => (
                  <div key={key} className="text-xs text-gray-700">
                    <span className="font-bold mr-1">{key}.</span> <LatexRenderer text={value} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Print Answer Key */}
      <div className="hidden print:block p-6 break-before-page">
        <h2 className="text-lg font-bold mb-4">Answer Key</h2>
        <div className="grid grid-cols-5 gap-2 text-sm">
          {paperData.questions.map((q, i) => (
            <div key={q.id} className="flex gap-1">
              <span className="font-bold">{i + 1}.</span>
              <span>{q.correct_answer}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
