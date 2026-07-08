'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  X,
  MessageCircle,
  Crown,
  Key,
  Shield,
  Swords,
  Trophy,
  ArrowLeft
} from 'lucide-react'
import { PageHeader } from '@/components/navigation'
import { AuroraBackground, GlassCard, SectionHeading, GradientButton } from '@/components/vidyax-ui'

// Custom inline SVG icons because brand icons are not exported in this version of lucide-react
const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    width="1em"
    height="1em"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    width="1em"
    height="1em"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

export default function PricingPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [activationStatus, setActivationStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })
  const [currentKey, setCurrentKey] = useState<string | null>(null)

  useEffect(() => {
    // Check if user has an active license key saved
    const savedKey = localStorage.getItem('vx_license_key')
    if (savedKey) {
      setCurrentKey(savedKey)
    }
  }, [])

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyInput.trim()) return

    // Allow mock validation of keys starting with "vx_"
    if (keyInput.startsWith('vx_')) {
      localStorage.setItem('vx_license_key', keyInput)
      setCurrentKey(keyInput)
      setActivationStatus({
        type: 'success',
        message: 'License key activated successfully! Pro features unlocked.'
      })
      setTimeout(() => {
        setShowModal(false)
        setActivationStatus({ type: null, message: '' })
        setKeyInput('')
      }, 2000)
    } else {
      setActivationStatus({
        type: 'error',
        message: 'Invalid license key. Keys must start with "vx_". Please contact the administrator.'
      })
    }
  }

  const handleRemoveKey = () => {
    localStorage.removeItem('vx_license_key')
    setCurrentKey(null)
    setActivationStatus({
      type: 'success',
      message: 'License key deactivated. Reverted to Free plan.'
    })
    setTimeout(() => {
      setActivationStatus({ type: null, message: '' })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-x-hidden pb-20">
      <AuroraBackground />
      <PageHeader backLabel="Back" onBack={() => router.back()} />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col items-center">
        <SectionHeading
          title="VidyaX Pro Plan"
          subtitle="Unlock complete standard GATE syllabus papers, infinite analytical questions, and peak performance tools."
          align="center"
          className="mb-12"
        />

        {currentKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 w-full max-w-xl p-4 bg-vx-purple/10 border border-vx-purple/35 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-vx-purple animate-pulse" />
              <div>
                <p className="text-sm font-bold text-white">Pro Mode Active</p>
                <p className="text-xs text-vx-muted font-mono">Key: {currentKey}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveKey}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20 transition-colors"
            >
              Remove Key
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-4">
          {/* Free Tier */}
          <GlassCard className="p-8 border border-vx-border/40 relative flex flex-col justify-between" delay={0.1}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-vx-text">Rookie / Practice</h3>
                  <p className="text-xs text-vx-text-secondary mt-1">For early GATE prep and concepts building</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-vx-emerald/10 text-vx-emerald flex items-center justify-center border border-vx-emerald/20">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              <div className="my-6">
                <span className="text-3xl font-extrabold text-white">Free</span>
                <span className="text-sm text-vx-muted"> / forever</span>
              </div>

              <div className="border-t border-vx-border/40 my-6" />

              <ul className="space-y-4 text-sm text-vx-text-secondary">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-vx-emerald mt-0.5 flex-shrink-0" />
                  <span>Access to **Rookie** & **Practice** difficulty levels</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-vx-emerald mt-0.5 flex-shrink-0" />
                  <span>Generate papers with 5 to 10 questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-vx-emerald mt-0.5 flex-shrink-0" />
                  <span>Basic step-by-step solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-vx-emerald mt-0.5 flex-shrink-0" />
                  <span>Study Planner & Focus Mode features</span>
                </li>
                <li className="flex items-start gap-3 text-red-400/80">
                  <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Rate limited to prevent LLM key exhaustion</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                disabled
                className="w-full py-3.5 bg-vx-graphite/60 border border-vx-border/80 text-vx-muted rounded-xl text-sm font-bold cursor-not-allowed"
              >
                Current Active Tier
              </button>
            </div>
          </GlassCard>

          {/* Pro Tier */}
          <GlassCard className="p-8 border-2 border-vx-purple/40 relative flex flex-col justify-between" delay={0.2}>
            <div className="absolute -top-3.5 right-6 bg-vx-purple text-white text-[10px] font-bold tracking-widest uppercase py-1 px-3 rounded-full border border-vx-purple/50">
              Highly Recommended
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-vx-purple flex items-center gap-1.5">
                    <Crown className="w-5 h-5 text-vx-purple animate-pulse" />
                    Competitive / Topper
                  </h3>
                  <p className="text-xs text-vx-text-secondary mt-1">For advanced rank targeters (AIR &lt; 100)</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-vx-purple/10 text-vx-purple flex items-center justify-center border border-vx-purple/20 animate-bounce">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <div className="my-6">
                <span className="text-3xl font-extrabold text-white">Custom Premium</span>
                <span className="text-sm text-vx-muted"> / activation</span>
              </div>

              <div className="border-t border-vx-border/40 my-6" />

              <ul className="space-y-4 text-sm text-white">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-vx-purple mt-0.5 flex-shrink-0" />
                  <span className="font-semibold text-vx-text">Unlock Competitive & Topper (GATE standard) levels</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-vx-purple mt-0.5 flex-shrink-0" />
                  <span>Generate full papers with 15 to 20 questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-vx-purple mt-0.5 flex-shrink-0" />
                  <span>AI Video Recommendation Library access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-vx-purple mt-0.5 flex-shrink-0" />
                  <span>AI Scribe Dojo writing grammar checks</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-vx-purple mt-0.5 flex-shrink-0" />
                  <span className="text-vx-purple font-semibold">Elevated rate limit capacity (faster responses)</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <GradientButton
                className="w-full"
                onClick={() => setShowModal(true)}
              >
                {currentKey ? 'Upgrade Info' : 'Upgrade to Pro'}
              </GradientButton>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Activation / Contact Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-vx-charcoal border border-vx-border w-full max-w-lg rounded-2xl p-6 md:p-8 relative shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => {
                  setShowModal(false)
                  setActivationStatus({ type: null, message: '' })
                }}
                className="absolute top-4 right-4 p-2 text-vx-text-secondary hover:text-vx-text rounded-lg hover:bg-vx-surface/50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-vx-purple/10 text-vx-purple flex items-center justify-center border border-vx-purple/20">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Purchase & Activate Pro</h3>
                  <p className="text-xs text-vx-muted">Get your activation key directly from the developer.</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3.5 bg-vx-graphite/40 border border-vx-border/60 rounded-xl p-5 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-vx-purple mb-2">Developer Contact Details</h4>
                
                <a
                  href="https://wa.me/917521866676"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-vx-text hover:text-green-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>WhatsApp: <strong className="text-white hover:underline">+91 7521866676</strong></span>
                </a>

                <a
                  href="https://www.linkedin.com/in/tarun-p-rai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-vx-text hover:text-vx-blue transition-colors"
                >
                  <LinkedInIcon className="w-4 h-4 text-vx-blue flex-shrink-0" />
                  <span>LinkedIn: <strong className="text-white hover:underline">linkedin.com/in/tarun-p-rai</strong></span>
                </a>

                <a
                  href="https://instagram.com/the_hatrixop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-vx-text hover:text-pink-400 transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>Instagram: <strong className="text-white hover:underline">@the_hatrixop</strong></span>
                </a>
              </div>

              {/* Activation Form */}
              <form onSubmit={handleActivate} className="space-y-4">
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vx-muted" />
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter License Key (e.g. vx_pro_test)"
                    className="input-modern !pl-10"
                    required
                  />
                </div>

                <GradientButton type="submit" className="w-full flex justify-center py-3">
                  Activate License Key
                </GradientButton>
              </form>

              {activationStatus.type && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-xl border text-xs text-left ${
                    activationStatus.type === 'success'
                      ? 'bg-vx-emerald/10 border-vx-emerald/30 text-vx-emerald'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {activationStatus.message}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
