'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Code, Database, Binary, Calculator, Cpu, Monitor, Server, Globe, Settings, Wrench, PenTool, BookOpen, Brain,
  ChevronRight, Sparkles, Search,
} from 'lucide-react'
import { PageHeader } from '@/components/navigation'
import { AuroraBackground, GlassCard, SectionHeading } from '@/components/vidyax-ui'

const SUBJECT_ICONS: Record<string, any> = {
  'c-programming': Code,
  'data-structures': Database,
  'algorithms': Binary,
  'discrete-mathematics': Calculator,
  'digital-logic': Cpu,
  'coa': Cpu,
  'operating-systems': Monitor,
  'dbms': Server,
  'computer-networks': Globe,
  'toc': Settings,
  'compiler-design': Wrench,
  'aptitude': PenTool,
  'engineering-mathematics': Calculator,
}

const SUBJECT_COLORS: Record<string, string> = {
  'c-programming': 'cyan',
  'data-structures': 'purple',
  'algorithms': 'purple',
  'discrete-mathematics': 'blue',
  'digital-logic': 'emerald',
  'coa': 'blue',
  'operating-systems': 'purple',
  'dbms': 'cyan',
  'computer-networks': 'emerald',
  'toc': 'blue',
  'compiler-design': 'cyan',
  'aptitude': 'emerald',
  'engineering-mathematics': 'emerald',
}

const subjects = [
  { id: 'c-programming', name: 'C Programming Basics', description: 'Variables, Operators, Control Statements, Pointers, Arrays, Structures, Recursion', topics: 8 },
  { id: 'data-structures', name: 'Data Structures', description: 'Stacks, Queues, Linked Lists, Trees, BSTs, Heaps, Graphs, Hashing', topics: 8 },
  { id: 'algorithms', name: 'Algorithms', description: 'Asymptotic Analysis, Sorting, Searching, Greedy, Dynamic Programming, Graphs', topics: 8 },
  { id: 'discrete-mathematics', name: 'Discrete Mathematics', description: 'Logic, Sets, Relations, Functions, Group Theory, Combinatorics, Graph Theory', topics: 6 },
  { id: 'digital-logic', name: 'Digital Logic', description: 'Boolean Algebra, K-Maps, Combinational & Sequential Circuits, Counters, Number Systems', topics: 5 },
  { id: 'coa', name: 'COA', description: 'Instructions, Addressing Modes, ALU, Control Design, Pipelining, Memory Hierarchy', topics: 5 },
  { id: 'operating-systems', name: 'Operating Systems', description: 'Processes, CPU Scheduling, Synchronization, Deadlocks, Memory Management, File Systems', topics: 7 },
  { id: 'dbms', name: 'DBMS', description: 'ER Model, Relational Algebra, SQL, Normalization, Transactions & Concurrency, Indexing', topics: 6 },
  { id: 'computer-networks', name: 'Computer Networks', description: 'OSI/TCP-IP Stack, Routing, IP Addressing, TCP/UDP, Application Protocols', topics: 6 },
  { id: 'toc', name: 'TOC', description: 'Finite Automata, Regular Grammars, Context-Free Languages, PDA, Turing Machines', topics: 6 },
  { id: 'compiler-design', name: 'Compiler Design', description: 'Lexical Analysis, Parsing, SDT, Intermediate Code, Runtime Environments, Optimization', topics: 6 },
  { id: 'aptitude', name: 'Aptitude', description: 'Percentages, Averages, Profit & Loss, Ratio, Time & Distance, Clocks, Calendars, Data Interpretation', topics: 12 },
  { id: 'engineering-mathematics', name: 'Engineering Mathematics', description: 'Linear Algebra, Calculus, Integration, Probability, Random Variables & Expectations', topics: 6 },
]

export default function SubjectsPage() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setTimeout(() => {
      router.push(`/topics/${subjectId}`)
    }, 400)
  }

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-hidden">
      <AuroraBackground />
      <PageHeader backLabel="VidyaX" backHref="/" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <SectionHeading
          title="Choose Your GATE Subject"
          subtitle="Select a subject from the 13 core GATE Computer Science syllabus. Generate targeted practice papers matching GATE exam standards."
        />

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 mb-10 max-w-md"
        >
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vx-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects..."
              className="input-modern !pl-10"
            />
          </div>
        </motion.div>

        {/* Subject Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredSubjects.map((subject) => {
            const Icon = SUBJECT_ICONS[subject.id] || BookOpen
            const color = SUBJECT_COLORS[subject.id] || 'purple'
            const isSelected = selectedSubject === subject.id

            const iconBg: Record<string, string> = {
              purple: 'bg-vx-purple/10 text-vx-purple',
              blue: 'bg-vx-blue/10 text-vx-blue',
              cyan: 'bg-vx-cyan/10 text-vx-cyan',
              emerald: 'bg-vx-emerald/10 text-vx-emerald',
            }

            const accentText: Record<string, string> = {
              purple: 'text-vx-purple',
              blue: 'text-vx-blue',
              cyan: 'text-vx-cyan',
              emerald: 'text-vx-emerald',
            }

            return (
              <motion.button
                key={subject.id}
                variants={itemVariants}
                onClick={() => handleSubjectSelect(subject.id)}
                className="text-left relative group"
                whileTap={{ scale: 0.97 }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="selectedBorder"
                    className="absolute inset-0 rounded-xl border-2 border-vx-purple z-20"
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                  />
                )}

                <GlassCard className="p-6 h-full" delay={0}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${iconBg[color]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-semibold ${accentText[color]} bg-vx-surface px-2.5 py-1 rounded-full border border-vx-border/40`}>
                      {subject.topics} Topics
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-vx-text group-hover:text-white transition-colors mb-2">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-vx-text-secondary leading-relaxed mb-4 line-clamp-2">
                    {subject.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-vx-muted group-hover:text-vx-purple transition-colors">
                    <span>Select</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </GlassCard>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-vx-border/30"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Topics', value: '125+', icon: BookOpen },
              { label: 'Questions', value: 'Unlimited', icon: Sparkles },
              { label: 'Solutions', value: 'Instant', icon: Brain },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-vx-surface border border-vx-border flex items-center justify-center mx-auto mb-3 text-vx-purple">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-vx-muted text-xs mb-1 font-medium">{stat.label}</p>
                  <p className="text-xl font-bold gradient-text">{stat.value}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
