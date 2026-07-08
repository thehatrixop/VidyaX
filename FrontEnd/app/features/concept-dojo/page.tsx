'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft,
  Search,
  Play,
  Info,
  X,
  Loader2,
  Tv,
  Sparkles,
  Clock,
  ThumbsUp,
  BookOpen
} from 'lucide-react'
import { PageHeader } from '@/components/navigation'
import { AuroraBackground, GlassCard, GradientButton, AIBadge, SectionHeading, LoadingSpinner } from '@/components/vidyax-ui'
import { getApiUrl } from '@/lib/utils'

interface VideoRecommendation {
  video_id: string
  title: string
  channel: string
  duration: string
  views_text: string
  relevance_score: number
  recommendation_reason: string
}

interface RecommendResponse {
  recommendations: VideoRecommendation[]
  rejection_message?: string
}

const TOPIC_PRESETS = [
  { name: 'Binary Search Trees', subject: 'Data Structures' },
  { name: 'CPU Scheduling Algorithms', subject: 'Operating Systems' },
  { name: 'SQL Joins Explained', subject: 'Database Systems' },
  { name: 'TCP 3-Way Handshake', subject: 'Computer Networks' }
]

export default function ConceptDojoPage() {
  const router = useRouter()

  // Input & search states
  const [chapterQuery, setChapterQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RecommendResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Active featured video state (defaults to recommendations[0])
  const [featuredVideo, setFeaturedVideo] = useState<VideoRecommendation | null>(null)

  // Player modal state
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null)

  // Info details popup state
  const [showInfoModal, setShowInfoModal] = useState<VideoRecommendation | null>(null)

  const resultsRef = useRef<HTMLDivElement>(null)

  const handleRecommend = async (queryTopic: string) => {
    if (!queryTopic.trim()) return

    setLoading(true)
    setErrorMsg('')
    setResults(null)
    setFeaturedVideo(null)

    try {
      const response = await fetch(getApiUrl('/api/v1/video/recommend'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chapter_name: queryTopic
        })
      })

      if (!response.ok) {
        throw new Error('Failed to retrieve video recommendations. Verify backend is active.')
      }

      const data: RecommendResponse = await response.json()
      setResults(data)

      if (data.recommendations && data.recommendations.length > 0) {
        setFeaturedVideo(data.recommendations[0])
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 150)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'An error occurred while fetching video details.')
    } finally {
      setLoading(false)
    }
  }

  const triggerSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handleRecommend(chapterQuery)
  }

  const selectPreset = (topicName: string) => {
    setChapterQuery(topicName)
    handleRecommend(topicName)
  }

  // Get YouTube thumbnail URL
  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/0.jpg`
  }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-x-hidden pb-20">
      <AuroraBackground />

      {/* Header Nav */}
      <PageHeader backLabel="VidyaX" backHref="/" />

      {/* Main Body */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        
        {/* Search Console */}
        <div className="w-full max-w-3xl flex flex-col items-center text-center mb-12">
          
          <div className="mb-4">
            <AIBadge label="AI-Curated Content" />
          </div>

          <SectionHeading
            title="Video Library"
            subtitle="Search any GATE Computer Science topic to instantly discover high-quality, AI-curated video lectures ranked by relevance and explanation depth."
            align="center"
          />

          {/* Search Box */}
          <form onSubmit={triggerSearch} className="w-full max-w-xl mt-8 relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={chapterQuery}
                onChange={(e) => setChapterQuery(e.target.value)}
                placeholder="Search e.g. Binary Search Trees, SQL Joins, TCP Protocol"
                className="w-full input-glass !py-4 !pl-12 !pr-28 text-sm"
                required
              />
              <Search className="absolute left-4 w-5 h-5 text-vx-muted pointer-events-none" />
              <div className="absolute right-2">
                <GradientButton
                  type="submit"
                  disabled={loading || !chapterQuery.trim()}
                  size="sm"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                </GradientButton>
              </div>
            </div>
          </form>

          {/* Preset Suggestions */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl">
            {TOPIC_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => selectPreset(preset.name)}
                disabled={loading}
                className="px-3.5 py-1.5 bg-vx-graphite/40 border border-vx-border/60 hover:border-vx-purple/60 rounded-full text-xs font-semibold text-vx-text-secondary hover:text-vx-purple transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3 h-3 text-vx-purple" />
                <span>{preset.name}</span>
                <span className="text-[9px] bg-vx-surface px-1.5 py-0.5 rounded-full border border-vx-border/20 text-vx-muted font-bold">
                  {preset.subject}
                </span>
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 max-w-xl w-full mt-6 text-left flex items-start gap-2.5">
              <X className="w-4 h-4 mt-0.5 flex-shrink-0 cursor-pointer hover:text-red-300" onClick={() => setErrorMsg('')} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {results && !loading && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full space-y-12"
            >
              
              {/* Rejection Message for non-academic topics */}
              {results.rejection_message && (
                <div className="w-full flex justify-center py-6">
                  <GlassCard className="p-8 max-w-xl w-full text-center space-y-4 border-red-500/20" hover={false} delay={0}>
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-vx-text">Non-Academic Topic</h3>
                    <p className="text-sm text-vx-text-secondary leading-relaxed">
                      "{results.rejection_message}"
                    </p>
                  </GlassCard>
                </div>
              )}

              {/* Featured #1 Video */}
              {featuredVideo && (
                <div className="w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left: Info (5 columns) */}
                    <motion.div 
                      key={featuredVideo.video_id + '-info'}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="lg:col-span-5 flex flex-col justify-center space-y-5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="bg-vx-purple/10 border border-vx-purple/20 text-vx-purple px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Top Match
                        </span>
                        <span className="text-sm font-semibold text-vx-emerald">
                          {featuredVideo.relevance_score}% Relevance Score
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-vx-text leading-tight">
                        {featuredVideo.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-vx-muted font-medium">
                        <span className="text-vx-purple font-semibold">{featuredVideo.channel}</span>
                        <span className="w-1 h-1 rounded-full bg-vx-border" />
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredVideo.duration}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-vx-border" />
                        <span>{featuredVideo.views_text}</span>
                      </div>

                      <p className="text-sm text-vx-text-secondary leading-relaxed">
                        {featuredVideo.recommendation_reason}
                      </p>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <GradientButton
                          onClick={() => setActivePlayerId(featuredVideo.video_id)}
                          size="md"
                        >
                          <Play className="w-4 h-4 fill-white" /> Play Video
                        </GradientButton>
                        <button
                          onClick={() => setShowInfoModal(featuredVideo)}
                          className="btn-glass px-6 py-3 text-sm flex items-center gap-2"
                        >
                          <Info className="w-4 h-4" /> Recommendation logic
                        </button>
                      </div>
                    </motion.div>

                    {/* Right: #1 Featured Thumbnail (7 columns) */}
                    <motion.div
                      key={featuredVideo.video_id + '-thumb'}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="lg:col-span-7"
                    >
                      <div 
                        onClick={() => setActivePlayerId(featuredVideo.video_id)}
                        className="relative rounded-2xl overflow-hidden group cursor-pointer border border-vx-border/60 shadow-xl shadow-vx-purple/5"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-vx-graphite">
                          <img
                            src={getThumbnailUrl(featuredVideo.video_id)}
                            alt={featuredVideo.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-14 h-14 rounded-full bg-vx-purple/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                              <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                            </div>
                          </div>

                          <div className="absolute top-4 left-4 bg-vx-purple text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            #1 Top Rated
                          </div>
                        </div>
                      </div>
                    </motion.div>

                  </div>
                </div>
              )}

              {/* Other Recommendations Grid */}
              {results.recommendations.length > 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-vx-border/40 pb-3">
                    <h3 className="text-lg font-bold text-vx-text flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-vx-purple" />
                      More Curated Recommendations
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {results.recommendations.slice(1).map((video, index) => {
                      const isSelected = featuredVideo?.video_id === video.video_id
                      const realIndex = index + 1
                      return (
                        <motion.div
                          key={video.video_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: realIndex * 0.08, duration: 0.4 }}
                          whileHover={{ y: -4 }}
                          onClick={() => setFeaturedVideo(video)}
                          className="cursor-pointer"
                        >
                          <GlassCard 
                            className={`h-full flex flex-col overflow-hidden p-0 ${
                              isSelected ? 'border-vx-purple shadow-lg shadow-vx-purple/5' : ''
                            }`}
                            hover={false}
                            delay={0}
                          >
                            <div className="relative aspect-video w-full overflow-hidden bg-vx-graphite">
                              <img
                                src={getThumbnailUrl(video.video_id)}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 bg-vx-black/85 px-2 py-0.5 rounded text-[9px] font-semibold text-vx-emerald flex items-center gap-0.5 border border-vx-border/30">
                                <ThumbsUp className="w-2.5 h-2.5 fill-vx-emerald/20" />
                                {video.relevance_score}%
                              </div>
                              
                              <div className="absolute bottom-2 right-2 bg-vx-black/90 px-1.5 py-0.5 rounded text-[9px] font-mono text-vx-text flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-vx-purple" />
                                {video.duration}
                              </div>

                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-vx-black/80 border border-vx-border/60 text-[10px] font-bold flex items-center justify-center text-vx-purple">
                                #{realIndex + 1}
                              </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                              <div>
                                <h4 className="text-xs font-bold text-vx-text line-clamp-2 leading-tight">
                                  {video.title}
                                </h4>
                                <p className="text-[10px] text-vx-muted font-semibold mt-1">
                                  {video.channel}
                                </p>
                              </div>
                              <div className="text-[10px] text-vx-muted font-medium pt-2 border-t border-vx-border/30 flex justify-between items-center">
                                <span>{video.views_text}</span>
                                <span className="text-[9px] bg-vx-purple/10 text-vx-purple px-1.5 py-0.5 rounded border border-vx-purple/20 font-bold uppercase">
                                  Select
                                </span>
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Embedded YouTube Player Modal */}
      <AnimatePresence>
        {activePlayerId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-vx-black/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-vx-charcoal border border-vx-border rounded-xl w-full max-w-4xl overflow-hidden relative shadow-2xl"
            >
              {/* Modal Header */}
              <div className="px-4 py-3 bg-vx-surface/40 border-b border-vx-border/40 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-vx-purple flex items-center gap-1.5">
                  <Tv className="w-4 h-4" /> Video Player
                </span>
                <button
                  onClick={() => setActivePlayerId(null)}
                  className="p-1 rounded-full hover:bg-vx-surface/60 text-vx-muted hover:text-vx-text transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* YouTube Iframe */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activePlayerId}?autoplay=1&rel=0&modestbranding=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Details Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-vx-black/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-vx-charcoal border border-vx-border rounded-xl w-full max-w-lg p-6 relative shadow-2xl"
            >
              <button
                onClick={() => setShowInfoModal(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-vx-surface/60 text-vx-muted hover:text-vx-text transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-vx-purple/10 border border-vx-purple/20 text-vx-purple px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    AI Curator Analysis
                  </span>
                  <span className="text-xs font-semibold text-vx-emerald">
                    {showInfoModal.relevance_score}% Match
                  </span>
                </div>

                <h3 className="text-lg font-bold text-vx-text leading-tight pr-6">
                  {showInfoModal.title}
                </h3>

                <div className="text-xs text-vx-muted space-y-1.5 pt-2">
                  <p><strong>Channel:</strong> <span className="text-vx-text-secondary">{showInfoModal.channel}</span></p>
                  <p><strong>Duration:</strong> <span className="text-vx-text-secondary">{showInfoModal.duration}</span></p>
                  <p><strong>Stats:</strong> <span className="text-vx-text-secondary">{showInfoModal.views_text}</span></p>
                </div>

                <div className="border-t border-vx-border/40 pt-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-vx-purple">
                    Curator Notes
                  </h4>
                  <p className="text-xs text-vx-text-secondary leading-relaxed bg-vx-graphite/40 p-3 rounded-lg border border-vx-border/20">
                    {showInfoModal.recommendation_reason}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <GradientButton
                    onClick={() => {
                      const vid = showInfoModal.video_id
                      setShowInfoModal(null)
                      setActivePlayerId(vid)
                    }}
                  >
                    Play Video
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
