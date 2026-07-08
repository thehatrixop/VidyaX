'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, VolumeX, Settings, Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/navigation'
import { AuroraBackground, GradientButton, GlassCard } from '@/components/vidyax-ui'

type TimerMode = 'work' | 'shortBreak' | 'longBreak'

interface PresetConfig {
  label: string
  minutes: number
  color: string
  gradient: string
}

const PRESETS: Record<TimerMode, PresetConfig> = {
  work: { label: 'Study Block', minutes: 25, color: '#8b5cf6', gradient: 'from-vx-purple to-vx-blue' },
  shortBreak: { label: '5 Min Break', minutes: 5, color: '#06b6d4', gradient: 'from-vx-cyan to-vx-blue' },
  longBreak: { label: '15 Min Break', minutes: 15, color: '#10b981', gradient: 'from-vx-emerald to-vx-cyan' },
}

const QUOTES = {
  work: [
    "Focus mode is active. Dedicate this block to deep study. No distractions!",
    "Concentrate on your subject. Build your knowledge brick by brick.",
    "The clock is ticking, but your mind is still. Find your study flow.",
    "This training session will pay off on exam day. Stay focused!",
  ],
  shortBreak: [
    "Great work! Relax for a few minutes. Stretch, drink water, and rest.",
    "Break active. Your brain is processing the knowledge right now.",
    "Time to recharge. Quick stretch before the next session!",
  ],
  longBreak: [
    "A well-deserved extended break! Take a walk or grab a snack.",
    "Maximum recovery mode. Step away from the screen and refresh!",
  ],
}

export default function FocusDojoPage() {
  const router = useRouter()
  const [mode, setMode] = useState<TimerMode>('work')
  const [timeLeft, setTimeLeft] = useState<number>(PRESETS.work.minutes * 60)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0)
  const [quoteIndex, setQuoteIndex] = useState<number>(0)
  const [customMinutes, setCustomMinutes] = useState<string>('')
  const [showFinishedAlert, setShowFinishedAlert] = useState<boolean>(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Web Audio API Sound Synthesizer
  const playChime = () => {
    if (isMuted) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, start)
        gain.gain.setValueAtTime(0.25, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(start + duration)
      }

      playTone(523.25, ctx.currentTime, 0.2)
      playTone(659.25, ctx.currentTime + 0.1, 0.2)
      playTone(783.99, ctx.currentTime + 0.2, 0.35)
    } catch (e) {
      console.error("Synthesizer failed", e)
    }
  }

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, mode])

  const handleTimerComplete = () => {
    setIsRunning(false)
    playChime()
    setShowFinishedAlert(true)
    
    if (mode === 'work') {
      setSessionsCompleted((prev) => prev + 1)
    }

    setTimeout(() => {
      setShowFinishedAlert(false)
      if (mode === 'work') {
        switchMode(sessionsCompleted % 3 === 2 ? 'longBreak' : 'shortBreak')
      } else {
        switchMode('work')
      }
    }, 4000)
  }

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(PRESETS[newMode].minutes * 60)
    setQuoteIndex(Math.floor(Math.random() * QUOTES[newMode].length))
    setCustomMinutes('')
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    if (customMinutes) {
      setTimeLeft(parseInt(customMinutes) * 60)
    } else {
      setTimeLeft(PRESETS[mode].minutes * 60)
    }
  }

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(customMinutes)
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      setIsRunning(false)
      setTimeLeft(parsed * 60)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const totalPresetSeconds = PRESETS[mode].minutes * 60
  const activeTotalSeconds = customMinutes ? parseInt(customMinutes) * 60 : totalPresetSeconds
  const progressPercent = ((activeTotalSeconds - timeLeft) / activeTotalSeconds) * 100
  const currentPreset = PRESETS[mode]

  // SVG circular progress
  const radius = 140
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-hidden flex flex-col">
      <AuroraBackground />

      <PageHeader
        backLabel="VidyaX"
        backHref="/"
        rightContent={
          <div className="flex items-center gap-3">
            <span className="text-xs text-vx-muted font-medium">
              {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed
            </span>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg glass text-vx-text-secondary hover:text-vx-text transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        }
      />

      <main className="flex-1 flex flex-col justify-center items-center relative z-10 px-6 py-12">
        {/* Mode label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <span className="text-xs font-semibold text-vx-muted uppercase tracking-widest">
            {mode === 'work' ? 'Study Session' : 'Break Time'}
          </span>
        </motion.div>

        {/* Circular Timer */}
        <div 
          onClick={toggleTimer}
          className="relative cursor-pointer select-none group mb-10"
        >
          {/* SVG Circle */}
          <svg width="320" height="320" className="transform -rotate-90">
            {/* Background track */}
            <circle
              cx="160" cy="160" r={radius}
              fill="none"
              stroke="rgba(42, 46, 63, 0.5)"
              strokeWidth="6"
            />
            {/* Progress arc */}
            <circle
              cx="160" cy="160" r={radius}
              fill="none"
              stroke="url(#timerGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-6xl sm:text-7xl font-bold font-mono tracking-tight text-vx-text group-hover:text-white transition-colors"
              animate={isRunning ? { scale: [1, 1.01, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              {formatTime(timeLeft)}
            </motion.div>
            <span className="text-xs text-vx-muted group-hover:text-vx-text-secondary transition-colors mt-2">
              {isRunning ? 'Click to pause' : 'Click to start'}
            </span>
          </div>

          {/* Glow effect */}
          {isRunning && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 60px ${currentPreset.color}20, 0 0 120px ${currentPreset.color}10` }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
        </div>

        {/* Preset Selectors (hidden when running) */}
        <AnimatePresence>
          {!isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="flex gap-2 bg-vx-graphite/50 rounded-xl p-1 border border-vx-border/40">
                {(Object.keys(PRESETS) as TimerMode[]).map((key) => {
                  const preset = PRESETS[key]
                  const isActive = mode === key
                  return (
                    <button
                      key={key}
                      onClick={() => switchMode(key)}
                      className={`relative px-5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'text-vx-text'
                          : 'text-vx-muted hover:text-vx-text-secondary'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeMode"
                          className="absolute inset-0 bg-vx-surface rounded-lg"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{preset.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <GradientButton onClick={toggleTimer} size="lg">
            {isRunning ? 'Pause' : 'Start Focus'}
          </GradientButton>
          <button onClick={resetTimer} className="btn-glass px-6 py-3">
            Reset
          </button>
        </div>

        {/* Custom Duration (hidden when running) */}
        <AnimatePresence>
          {!isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleCustomTimeSubmit} className="flex items-center gap-2 glass rounded-xl p-2">
                <Settings className="w-4 h-4 text-vx-purple ml-2" />
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="Custom min"
                  min="1"
                  max="180"
                  className="bg-transparent text-vx-text text-sm px-2 py-2 w-28 focus:outline-none placeholder-vx-muted text-center font-semibold font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-vx-surface hover:bg-vx-surface/80 text-vx-text rounded-lg text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivational Quote */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="mt-12 max-w-md text-center"
        >
          <p className="text-sm text-vx-text-secondary italic leading-relaxed">
            "{QUOTES[mode][quoteIndex % QUOTES[mode].length]}"
          </p>
        </motion.div>
      </main>

      {/* Bottom Progress Bar */}
      <div className="w-full h-1 bg-vx-graphite/40 relative z-20">
        <div 
          className="h-full bg-gradient-to-r from-vx-purple via-vx-blue to-vx-cyan transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Completion Overlay */}
      <AnimatePresence>
        {showFinishedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-vx-black/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center space-y-6"
            >
              <motion.div
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-vx-purple to-vx-blue flex items-center justify-center mx-auto shadow-2xl shadow-vx-purple/30"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold gradient-text">
                Session Complete!
              </h2>
              <p className="text-vx-text-secondary text-lg">
                Great work! Transitioning to next phase...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
