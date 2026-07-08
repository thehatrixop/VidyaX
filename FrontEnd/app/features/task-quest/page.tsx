'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Filter, Calendar, Bell, BellOff, Trash2, Play,
  MessageSquare, X, Edit2, Clock, CheckCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/navigation'
import { AuroraBackground, GlassCard, GradientButton, EmptyState } from '@/components/vidyax-ui'

interface Task {
  id: string
  title: string
  description: string
  status: 'backlog' | 'inProgress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  reminderTime?: string
  notified?: boolean
}

type ColumnStatus = Task['status']

interface ColumnConfig {
  id: ColumnStatus
  title: string
  color: string
  iconBg: string
}

const COLUMNS: ColumnConfig[] = [
  { id: 'backlog', title: 'Backlog', color: 'text-red-400', iconBg: 'bg-red-500/10' },
  { id: 'inProgress', title: 'In Progress', color: 'text-vx-purple', iconBg: 'bg-vx-purple/10' },
  { id: 'review', title: 'Review', color: 'text-vx-cyan', iconBg: 'bg-vx-cyan/10' },
  { id: 'completed', title: 'Completed', color: 'text-vx-emerald', iconBg: 'bg-vx-emerald/10' },
]

const MOCK_TASKS: Task[] = []

export default function TaskQuestPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ColumnStatus | null>(null)
  const [filterTag, setFilterTag] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskStatus, setTaskStatus] = useState<ColumnStatus>('backlog')
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('medium')
  const [taskTagsInput, setTaskTagsInput] = useState('')
  const [taskReminder, setTaskReminder] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('dojoTasks')
    if (stored) {
      try {
        setTasks(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse stored tasks", e)
        setTasks(MOCK_TASKS)
      }
    } else {
      setTasks(MOCK_TASKS)
      localStorage.setItem('dojoTasks', JSON.stringify(MOCK_TASKS))
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
    localStorage.setItem('dojoTasks', JSON.stringify(newTasks))
  }

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("Browser notifications are not supported.")
      return
    }
    const permission = await Notification.requestPermission()
    setNotificationsEnabled(permission === 'granted')
  }

  useEffect(() => {
    const checkReminders = () => {
      if (!notificationsEnabled) return

      const now = new Date()
      const localYear = now.getFullYear()
      const localMonth = String(now.getMonth() + 1).padStart(2, '0')
      const localDate = String(now.getDate()).padStart(2, '0')
      const localHours = String(now.getHours()).padStart(2, '0')
      const localMins = String(now.getMinutes()).padStart(2, '0')
      const currentLocalString = `${localYear}-${localMonth}-${localDate}T${localHours}:${localMins}`

      let updated = false
      const nextTasks = tasks.map(task => {
        if (task.reminderTime && task.reminderTime <= currentLocalString && !task.notified && task.status !== 'completed') {
          try {
            new Notification("Study Time! ⏱️", {
              body: `Task Reminder: "${task.title}" is scheduled to start now.`,
            })
            playChime()
          } catch (err) {
            console.error("Notification failed", err)
          }
          updated = true
          return { ...task, notified: true }
        }
        return task
      })

      if (updated) {
        saveTasks(nextTasks)
      }
    }

    const interval = setInterval(checkReminders, 15000)
    return () => clearInterval(interval)
  }, [tasks, notificationsEnabled])

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, columnId: ColumnStatus) => {
    e.preventDefault()
    if (dragOverColumn !== columnId) setDragOverColumn(columnId)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: ColumnStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId
    if (taskId) {
      const nextTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status: targetStatus, notified: targetStatus === 'completed' ? true : task.notified }
        }
        return task
      })
      saveTasks(nextTasks)
    }
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  const openAddTask = () => {
    setEditingTask(null)
    setTaskTitle('')
    setTaskDesc('')
    setTaskStatus('backlog')
    setTaskPriority('medium')
    setTaskTagsInput('')
    setTaskReminder('')
    setShowAddModal(true)
  }

  const openEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskTitle(task.title)
    setTaskDesc(task.description)
    setTaskStatus(task.status)
    setTaskPriority(task.priority)
    setTaskTagsInput(task.tags.join(', '))
    setTaskReminder(task.reminderTime || '')
    setShowAddModal(true)
  }

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    const parsedTags = taskTagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

    if (editingTask) {
      const nextTasks = tasks.map(task => {
        if (task.id === editingTask.id) {
          return {
            ...task,
            title: taskTitle.trim(),
            description: taskDesc.trim(),
            status: taskStatus,
            priority: taskPriority,
            tags: parsedTags,
            reminderTime: taskReminder || undefined,
            notified: taskReminder !== task.reminderTime ? false : task.notified,
          }
        }
        return task
      })
      saveTasks(nextTasks)
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substring(2, 9),
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        status: taskStatus,
        priority: taskPriority,
        tags: parsedTags,
        reminderTime: taskReminder || undefined,
        notified: false,
      }
      saveTasks([...tasks, newTask])
    }

    setShowAddModal(false)
  }

  const handleDeleteTask = (taskId: string) => {
    const nextTasks = tasks.filter(task => task.id !== taskId)
    saveTasks(nextTasks)
    if (editingTask && editingTask.id === taskId) setShowAddModal(false)
  }

  const handleStartStudyBlock = (task: Task) => {
    localStorage.setItem('focusDojo_initialTitle', task.title)
    router.push('/features/focus-dojo')
  }

  const allUniqueTags = Array.from(new Set(tasks.flatMap(task => task.tags))).sort()

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !filterTag || task.tags.includes(filterTag)
    return matchesSearch && matchesTag
  })

  const getTasksByStatus = (status: ColumnStatus) => filteredTasks.filter(task => task.status === status)

  const getPriorityClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'medium': return 'text-vx-purple bg-vx-purple/10 border-vx-purple/20'
      case 'low': return 'text-vx-cyan bg-vx-cyan/10 border-vx-cyan/20'
    }
  }

  return (
    <div className="min-h-screen bg-vx-black text-vx-text relative overflow-x-hidden">
      <AuroraBackground />

      <PageHeader
        backLabel="VidyaX"
        backHref="/"
        rightContent={
          <button
            onClick={requestNotificationPermission}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              notificationsEnabled
                ? 'bg-vx-emerald/10 text-vx-emerald border border-vx-emerald/20'
                : 'glass text-vx-text-secondary hover:text-vx-text'
            }`}
          >
            {notificationsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            {notificationsEnabled ? 'Reminders On' : 'Enable Reminders'}
          </button>
        }
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Study Planner</h1>
            <p className="text-sm text-vx-text-secondary mt-1">Organize and track your GATE study objectives</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="input-modern w-48 text-sm py-2"
            />

            <div className="relative">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="input-modern text-sm py-2 pr-8 appearance-none cursor-pointer"
              >
                <option value="">All Tags</option>
                {allUniqueTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vx-muted pointer-events-none" />
            </div>

            <GradientButton onClick={openAddTask} size="sm">
              <Plus className="w-4 h-4" />
              Add Task
            </GradientButton>
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {COLUMNS.map(col => {
            const colTasks = getTasksByStatus(col.id)
            const isDragOver = dragOverColumn === col.id

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`glass-card p-4 flex flex-col gap-4 transition-all min-h-[350px] ${
                  isDragOver ? 'border-vx-purple/40 ring-1 ring-vx-purple/20' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex justify-between items-center pb-3 border-b border-vx-border/30">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.iconBg.replace('/10', '')}`}
                      style={{ backgroundColor: col.color === 'text-red-400' ? '#f87171' : col.color === 'text-vx-purple' ? '#8b5cf6' : col.color === 'text-vx-cyan' ? '#06b6d4' : '#10b981' }}
                    />
                    <span className="font-semibold text-sm">{col.title}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-vx-muted bg-vx-surface px-2 py-0.5 rounded-md border border-vx-border/40">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div className="flex flex-col gap-3 flex-1" onDragLeave={handleDragEnd}>
                  {colTasks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center py-8">
                        <CheckCircle className="w-7 h-7 text-vx-border mx-auto mb-2" />
                        <span className="text-xs text-vx-muted">No tasks</span>
                      </div>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <motion.div
                        key={task.id}
                        layout
                        draggable
                        onDragStart={(e: any) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className="group bg-vx-graphite/60 border border-vx-border/40 rounded-xl p-4 hover:border-vx-purple/30 transition-all cursor-grab active:cursor-grabbing space-y-3"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="font-semibold text-sm text-vx-text group-hover:text-white transition-colors leading-tight">
                            {task.title}
                          </h3>
                          <button
                            onClick={() => openEditTask(task)}
                            className="p-1 rounded text-vx-muted hover:text-vx-purple transition-colors flex-shrink-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-xs text-vx-muted line-clamp-2">{task.description}</p>
                        )}

                        {task.reminderTime && (
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-vx-cyan bg-vx-cyan/5 border border-vx-cyan/15 px-2 py-1 rounded-md w-fit">
                            <Clock className="w-3 h-3" />
                            {new Date(task.reminderTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}

                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map(tag => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-vx-surface border border-vx-border/40 text-vx-muted font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-vx-border/20">
                          <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                          <div className="flex items-center gap-2">
                            {col.id === 'inProgress' && (
                              <button
                                onClick={() => handleStartStudyBlock(task)}
                                className="flex items-center gap-1 px-2 py-1 bg-vx-purple/10 text-vx-purple border border-vx-purple/20 rounded text-[10px] font-semibold hover:bg-vx-purple/20 transition-colors"
                              >
                                <Play className="w-2.5 h-2.5" /> Study
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-vx-border/20 mt-16 text-center">
        <span className="text-[10px] text-vx-muted font-medium">
          VidyaX Study Planner for GATE Prep • Saved Locally
        </span>
      </footer>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-vx-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="glass-card p-7 w-full max-w-md relative z-10"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1 text-vx-muted hover:text-vx-text rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-xl font-bold mb-6 pb-3 border-b border-vx-border/30">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>

              <form onSubmit={handleSaveTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-vx-muted">Title</label>
                  <input type="text" required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. OS Semaphores practice" className="input-modern" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-vx-muted">Description</label>
                  <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Short description..." rows={3} className="input-modern resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-vx-muted">Status</label>
                    <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as ColumnStatus)} className="input-modern cursor-pointer">
                      <option value="backlog">Backlog</option>
                      <option value="inProgress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-vx-muted">Priority</label>
                    <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as Task['priority'])} className="input-modern cursor-pointer">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-vx-muted">Tags (comma-separated)</label>
                  <input type="text" value={taskTagsInput} onChange={(e) => setTaskTagsInput(e.target.value)}
                    placeholder="e.g. OS, Revision, DSA" className="input-modern" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-vx-muted flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-vx-cyan" /> Reminder (Optional)
                  </label>
                  <input type="datetime-local" value={taskReminder} onChange={(e) => setTaskReminder(e.target.value)}
                    className="input-modern font-mono cursor-pointer" />
                </div>

                <div className="flex justify-between items-center pt-4">
                  {editingTask ? (
                    <button type="button" onClick={() => handleDeleteTask(editingTask.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-lg text-xs font-semibold transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  ) : <div />}

                  <GradientButton>
                    {editingTask ? 'Save Task' : 'Create Task'}
                  </GradientButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
