'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft,
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  Info,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react'
import { PageHeader } from '@/components/navigation'
import { AuroraBackground, GlassCard, GradientButton, AIBadge, SectionHeading } from '@/components/vidyax-ui'
import { getApiUrl } from '@/lib/utils'

interface Correction {
  original_part: string
  corrected_part: string
  rule_category: string
  explanation: string
}

interface GrammarCheckResponse {
  corrected_text: string
  overall_feedback: string
  corrections: Correction[]
  suggestions: string[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const EXAMPLES = [
  {
    title: 'Leave Application',
    context: 'Leave Application',
    text: 'dear boss i am writing this mail to tell you that i am sick and cannot come to office today please grant me leave i will do my work tomorrow thanks',
    description: 'Sickness leave request to employer'
  },
  {
    title: 'Meeting Reschedule',
    context: 'Meeting Reschedule',
    text: 'hi we need to reschedule our meeting tomorrow because something came up i am free on wednesday morning does that work for you let me know',
    description: 'Rescheduling a calendar event'
  },
  {
    title: 'Formal Mail',
    context: 'Formal Mail',
    text: 'respected sir i am sending the report that you asked yesterday please check it and tell me if there are any changes required in it',
    description: 'Project status report submission'
  }
]

// Custom Diff Highlighting function that splits words and matches edits
function highlightDiff(original: string, corrected: string, corrections: Correction[]) {
  if (!corrections || corrections.length === 0) {
    return { originalHTML: <span>{original}</span>, correctedHTML: <span>{corrected}</span> }
  }

  // Sort corrections by original part length descending to avoid sub-string replacement issues
  const sortedCorrections = [...corrections].sort((a, b) => b.original_part.length - a.original_part.length)

  // Highlight Original Text (Red / Line-through)
  const highlightOriginal = (text: string) => {
    const originalParts = sortedCorrections.map(c => c.original_part).filter(Boolean)
    if (originalParts.length === 0) return <span>{text}</span>

    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = originalParts.map(escapeRegExp).join('|')
    const regex = new RegExp(`(${pattern})`, 'gi')
    const segments = text.split(regex)

    return (
      <>
        {segments.map((segment, index) => {
          const match = originalParts.find(p => p.toLowerCase() === segment.toLowerCase())
          if (match) {
            return (
              <span 
                key={index} 
                className="bg-red-500/10 border-b-2 border-red-500/40 text-red-200 px-1 rounded-sm mx-0.5 line-through decoration-red-400 font-medium select-none"
                title={`Should be corrected`}
              >
                {segment}
              </span>
            )
          }
          return segment
        })}
      </>
    )
  }

  // Highlight Corrected Text (Green / Bold)
  const highlightCorrected = (text: string) => {
    const correctedParts = sortedCorrections.map(c => c.corrected_part).filter(Boolean)
    if (correctedParts.length === 0) return <span>{text}</span>

    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = correctedParts.map(escapeRegExp).join('|')
    const regex = new RegExp(`(${pattern})`, 'gi')
    const segments = text.split(regex)

    return (
      <>
        {segments.map((segment, index) => {
          const match = correctedParts.find(p => p.toLowerCase() === segment.toLowerCase())
          if (match) {
            return (
              <span 
                key={index} 
                className="bg-vx-emerald/10 border-b-2 border-vx-emerald/40 text-vx-emerald px-1.5 py-0.5 rounded-sm mx-0.5 font-bold shadow-sm"
              >
                {segment}
              </span>
            )
          }
          return segment
        })}
      </>
    )
  }

  return {
    originalHTML: highlightOriginal(original),
    correctedHTML: highlightCorrected(corrected)
  }
}

export default function ScribeDojoPage() {
  const router = useRouter()
  
  // Input states
  const [draftText, setDraftText] = useState('')
  const [context, setContext] = useState('')

  // API response states
  const [loading, setLoading] = useState(false)
  const [checkResponse, setCheckResponse] = useState<GrammarCheckResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Expandable corrections state
  const [expandedCorrectionIndex, setExpandedCorrectionIndex] = useState<number | null>(null)

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  const resultsRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  const selectExample = (ex: typeof EXAMPLES[0]) => {
    setDraftText(ex.text)
    setContext(ex.context)
  }

  const handleCheckGrammar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draftText.trim()) return

    setLoading(true)
    setErrorMsg('')
    setCheckResponse(null)
    setChatMessages([]) // Reset chat for new draft check

    const selectedContext = context.trim() || 'General'
    
    try {
      const response = await fetch(getApiUrl('/api/v1/grammar/check'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: draftText,
          context: selectedContext || 'General'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze draft. Please check if the backend service is running.')
      }

      const data = await response.json()
      setCheckResponse(data)
      
      // Initialize chat coach welcome message
      setChatMessages([
        {
          role: 'assistant',
          content: `Welcome to your Writing Lab feedback! I've corrected your draft for the **${selectedContext || 'General'}** context. 

Review the highlighted changes above and ask me questions about why any specific rules apply!`
        }
      ])

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred while connecting to the grammar coach.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !checkResponse || chatLoading) return

    const userMsg = chatInput.trim()
    setChatInput('')

    const nextHistory = [...chatMessages, { role: 'user', content: userMsg } as ChatMessage]
    setChatMessages(nextHistory)
    setChatLoading(true)

    const selectedContext = context.trim() || 'General'

    try {
      const response = await fetch(getApiUrl('/api/v1/grammar/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          original_text: draftText,
          corrected_text: checkResponse.corrected_text,
          context: selectedContext || 'General',
          corrections_json: JSON.stringify(checkResponse.corrections),
          message: userMsg,
          history: nextHistory.slice(1).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get answer from tutor')
      }

      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Oops! I had trouble contacting the coach server. Make sure the backend endpoint is active and try again.' 
        }
      ])
    } finally {
      setChatLoading(false)
    }
  }

  // Format tutor response helper
  function formatTutorResponse(content: string) {
    return content.split('\n').map((line, i) => {
      let key = i
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ')
      let cleanLine = line
      if (isBullet) {
        cleanLine = line.trim().substring(2)
      }
      
      const parts = cleanLine.split(/\*\*(.*?)\*\*/g)
      const renderedLine = parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="font-extrabold text-vx-purple">{part}</strong>
        }
        return part
      })

      if (isBullet) {
        return (
          <li key={key} className="ml-5 list-disc mb-1 leading-relaxed text-sm text-vx-text/90">
            {renderedLine}
          </li>
        )
      }
      
      return (
        <p key={key} className="mb-2 leading-relaxed text-sm text-vx-text/90 min-h-[1em]">
          {renderedLine}
        </p>
      )
    })
  }

  const { originalHTML, correctedHTML } = checkResponse 
    ? highlightDiff(draftText, checkResponse.corrected_text, checkResponse.corrections) 
    : { originalHTML: null, correctedHTML: null }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-x-hidden pb-16">
      <AuroraBackground />

      {/* Navigation Header */}
      <PageHeader backLabel="VidyaX" backHref="/" />

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-10 max-w-2xl">
          <AIBadge label="AI Writing Coach" />
          <SectionHeading
            title="Writing Lab"
            subtitle="Submit your essay drafts, emails, or reports. Receive instant grammar corrections, tone polishing, and detailed feedback."
            align="center"
          />
        </div>

        {/* Central input panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <GlassCard className="p-6 md:p-8" hover={false} delay={0}>
            <form onSubmit={handleCheckGrammar} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="draftText" className="block text-xs font-bold uppercase tracking-wider text-vx-text-secondary">
                  Draft Writing
                </label>
                <textarea
                  id="draftText"
                  rows={5}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Enter or paste your text draft here (e.g. 'i am sorry for delay in sending report...')"
                  className="input-modern min-h-[150px] resize-y leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="writingContext" className="block text-xs font-bold uppercase tracking-wider text-vx-text-secondary">
                  Writing Context / Purpose
                </label>
                <input
                  id="writingContext"
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe your writing's context/purpose (e.g. Sickness leave email to boss, project status update)"
                  className="input-modern"
                  autoComplete="off"
                  required
                />
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-end">
                <GradientButton 
                  disabled={loading || !draftText.trim()}
                  className="w-full md:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Draft...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Polish Writing</span>
                    </>
                  )}
                </GradientButton>
              </div>
            </form>
          </GlassCard>
        </motion.div>

        {/* Quick-Start Templates */}
        {!checkResponse && !loading && (
          <div className="w-full space-y-4 mt-12">
            <span className="text-xs font-bold uppercase tracking-widest text-vx-muted block text-center">
              Or pick an example draft to test
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXAMPLES.map((ex, index) => (
                <div
                  key={index}
                  onClick={() => selectExample(ex)}
                  className="cursor-pointer group"
                >
                  <GlassCard className="p-5 h-32 flex flex-col justify-between" hover={true} delay={0.05 * index}>
                    <div>
                      <h3 className="text-sm font-bold text-vx-text group-hover:text-vx-purple transition-colors flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {ex.title}
                      </h3>
                      <p className="text-[10px] text-vx-muted mt-1 leading-snug">
                        {ex.description}
                      </p>
                    </div>
                    <p className="text-xs text-vx-text-secondary line-clamp-2 italic pt-2 border-t border-vx-border/40">
                      "{ex.text}"
                    </p>
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        <AnimatePresence>
          {checkResponse && !loading && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full mt-12 space-y-8"
            >
              
              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px bg-vx-border/40 flex-1" />
                <span className="text-xs font-bold uppercase tracking-widest text-vx-purple">
                  Analysis Results
                </span>
                <div className="h-px bg-vx-border/40 flex-1" />
              </div>

              {/* Side-by-Side Diff Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Draft Panel */}
                <GlassCard className="p-5 flex flex-col min-h-[220px]" hover={false} delay={0}>
                  <div className="flex items-center gap-2 mb-3 border-b border-vx-border/40 pb-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-vx-text">Original Draft</h3>
                  </div>
                  <div className="text-sm leading-relaxed text-vx-text-secondary whitespace-pre-wrap overflow-y-auto max-h-[240px] flex-1">
                    {originalHTML}
                  </div>
                </GlassCard>

                {/* Polished Panel */}
                <GlassCard className="p-5 flex flex-col min-h-[220px]" hover={false} delay={0.1}>
                  <div className="flex items-center gap-2 mb-3 border-b border-vx-border/40 pb-2">
                    <span className="w-2 h-2 rounded-full bg-vx-emerald" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-vx-text">Polished Version</h3>
                  </div>
                  <div className="text-sm font-semibold leading-relaxed text-vx-text whitespace-pre-wrap overflow-y-auto max-h-[240px] flex-1">
                    {correctedHTML}
                  </div>
                </GlassCard>

              </div>

              {/* Coach Feedback */}
              <GlassCard className="p-5 border-vx-purple/20 bg-vx-purple/5 relative overflow-hidden" hover={false} delay={0.2}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-vx-purple/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vx-purple to-vx-blue flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-vx-purple">Coach Overall Feedback</h4>
                    <p className="text-sm text-vx-text-secondary leading-relaxed">{checkResponse.overall_feedback}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Corrections & Suggestions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Corrections breakdown (left, 2 columns) */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-vx-muted flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-vx-purple" />
                    Correction Breakdown ({checkResponse.corrections.length})
                  </h3>
                  
                  {checkResponse.corrections.length === 0 ? (
                    <GlassCard className="p-6 text-center" hover={false} delay={0.3}>
                      <CheckCircle className="w-8 h-8 text-vx-emerald mx-auto mb-2" />
                      <p className="text-sm font-bold text-vx-text">Perfect Draft!</p>
                      <p className="text-xs text-vx-muted mt-1">No grammatical changes were required for this writing context.</p>
                    </GlassCard>
                  ) : (
                    <div className="space-y-3">
                      {checkResponse.corrections.map((corr, idx) => {
                        const isExpanded = expandedCorrectionIndex === idx
                        return (
                          <div 
                            key={idx}
                            className="glass-card overflow-hidden"
                          >
                            {/* Accordion Trigger */}
                            <button
                              onClick={() => setExpandedCorrectionIndex(isExpanded ? null : idx)}
                              className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-xs md:text-sm text-vx-text focus:outline-none"
                            >
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="bg-vx-purple/10 border border-vx-purple/20 text-vx-purple px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                  {corr.rule_category}
                                </span>
                                <span className="text-red-400 line-through truncate max-w-[80px] sm:max-w-[120px]">
                                  {corr.original_part}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-vx-muted" />
                                <span className="text-vx-emerald font-bold truncate max-w-[80px] sm:max-w-[120px]">
                                  {corr.corrected_part}
                                </span>
                              </div>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-vx-muted" /> : <ChevronDown className="w-4 h-4 text-vx-muted" />}
                            </button>

                            {/* Accordion Content */}
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: 'auto' }}
                                  exit={{ height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 pt-1 border-t border-vx-border/40 text-xs text-vx-text-secondary leading-relaxed space-y-2 bg-vx-graphite/20">
                                    <div className="flex items-start gap-1.5">
                                      <Info className="w-3.5 h-3.5 text-vx-purple mt-0.5 flex-shrink-0" />
                                      <p>{corr.explanation}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Suggestions List (right, 1 column) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-vx-muted flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-vx-purple" />
                    Key Suggestions
                  </h3>

                  <GlassCard className="p-5 space-y-4" hover={false} delay={0.4}>
                    {checkResponse.suggestions.length === 0 ? (
                      <p className="text-xs text-vx-muted italic text-center py-4">No additional recommendations.</p>
                    ) : (
                      <ul className="space-y-3 relative z-10">
                        {checkResponse.suggestions.map((sug, idx) => (
                          <li key={idx} className="flex gap-2 text-xs text-vx-text-secondary leading-relaxed">
                            <span className="text-vx-purple select-none">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </GlassCard>
                </div>

              </div>

              {/* Chat Coach Console */}
              <div className="w-full space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-vx-muted flex items-center gap-2">
                  <Bot className="w-4 h-4 text-vx-purple animate-pulse" />
                  Ask Writing Coach
                </h3>

                <div className="glass-card overflow-hidden flex flex-col">
                  {/* Chat Console Header */}
                  <div className="px-4 py-3 bg-vx-surface/40 border-b border-vx-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vx-purple to-vx-blue flex items-center justify-center text-white">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide text-vx-text">Writing Coach Bot</h4>
                        <p className="text-[10px] text-vx-muted font-medium">Interactive Learning Assistant</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-vx-purple/10 border border-vx-purple/20 text-vx-purple px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      COACH CHAT
                    </span>
                  </div>

                  {/* Chat Console Message Thread */}
                  <div className="p-4 max-h-[350px] overflow-y-auto space-y-4">
                    <AnimatePresence initial={false}>
                      {chatMessages.map((msg, index) => {
                        const isUser = msg.role === 'user'
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isUser && (
                              <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-br from-vx-purple to-vx-blue flex items-center justify-center text-white select-none">
                                <Bot className="w-3.5 h-3.5" />
                              </div>
                            )}
                            
                            <div
                              className={`max-w-[85%] p-3 rounded-xl text-vx-text border ${
                                isUser
                                  ? 'bg-vx-surface border-vx-border rounded-tr-none text-sm'
                                  : 'bg-vx-graphite/80 border-vx-border/40 rounded-tl-none text-sm'
                              }`}
                            >
                              <div className="whitespace-pre-wrap">{formatTutorResponse(msg.content)}</div>
                            </div>

                            {isUser && (
                              <div className="w-7 h-7 flex-shrink-0 rounded-full bg-vx-surface border border-vx-border flex items-center justify-center text-vx-text-secondary select-none">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>

                    {chatLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 justify-start"
                      >
                        <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-br from-vx-purple to-vx-blue flex items-center justify-center text-white">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-vx-graphite/80 border border-vx-border/40 max-w-[85%] p-3 rounded-xl flex items-center gap-2 text-vx-muted text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-vx-purple" />
                          <span>Coach is formulating analysis...</span>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Console Input form */}
                  <form onSubmit={handleSendChatMessage} className="p-3 border-t border-vx-border/40 bg-vx-graphite/30 flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                      placeholder="Ask the coach (e.g. 'Can we make it sound more professional?')"
                      className="flex-1 input-glass text-xs px-3.5 py-3 rounded-lg focus:outline-none"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="p-3 rounded-lg bg-gradient-to-br from-vx-purple to-vx-blue text-white disabled:opacity-40 flex items-center justify-center font-bold"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </motion.button>
                  </form>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}
