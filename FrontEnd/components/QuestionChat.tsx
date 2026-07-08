'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import LatexRenderer from './LatexRenderer'
import { getApiUrl } from '@/lib/utils'

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

interface QuestionChatProps {
  question: Question
  selectedAnswer: string
}

interface BlockToken {
  type: 'code' | 'display-math' | 'table' | 'header' | 'list' | 'blockquote' | 'paragraph'
  level?: number
  lang?: string
  content: string
}

export default function QuestionChat({ question, selectedAnswer }: QuestionChatProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Seed the initial tutor message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi there! I'm your VidyaX AI Tutor, specialized in GATE CS preparation. I notice you chose option **${selectedAnswer}** for this question, while the correct answer is **${question.correct_answer}**.

Let's review this together. Where did you run into difficulty, or would you like me to walk you through the correct conceptual logic step-by-step?`
      }
    ])
  }, [question, selectedAnswer])

  // Scroll to bottom on new message or loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
    const updatedHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...messages,
      { role: 'user', content: userMessage }
    ]
    setMessages(updatedHistory)
    setLoading(true)

    try {
      const response = await fetch(getApiUrl('/api/v1/chat/analyze-mistake'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          options: question.options,
          correct_answer: question.correct_answer,
          selected_answer: selectedAnswer,
          explanation: question.explanation,
          message: userMessage,
          history: updatedHistory.slice(1).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get answer from tutor')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Oops! I encountered an issue connecting to the AI Tutor server. Please make sure the backend is running and try again.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  function parseBlocks(content: string): BlockToken[] {
    const blocks: BlockToken[] = []
    
    // Normalize newlines
    const normalized = content.replace(/\r\n/g, '\n')
    
    const placeholders: Array<{ placeholder: string; token: BlockToken }> = []
    let tempText = normalized
    
    // 1. Extract code blocks: ```lang\ncode\n```
    const codeRegex = /```(\w*)\n([\s\S]*?)```/g
    let match
    let codeId = 0
    while ((match = codeRegex.exec(tempText)) !== null) {
      const placeholder = `___BLOCK_CODE_${codeId}___`
      placeholders.push({
        placeholder,
        token: {
          type: 'code',
          lang: match[1],
          content: match[2]
        }
      })
      tempText = tempText.replace(match[0], placeholder)
      codeId++
      codeRegex.lastIndex = 0 // reset search due to modifications
    }
    
    // 2. Extract display-math blocks: \[math\] or $$math$$
    const mathRegex = /\\{1,2}\[([\s\S]*?)\\{1,2}\]|\$\$([\s\S]*?)\$\$/g
    let mathId = 0
    while ((match = mathRegex.exec(tempText)) !== null) {
      const placeholder = `___BLOCK_MATH_${mathId}___`
      placeholders.push({
        placeholder,
        token: {
          type: 'display-math',
          content: match[1] !== undefined ? match[1] : match[2]
        }
      })
      tempText = tempText.replace(match[0], placeholder)
      mathId++
      mathRegex.lastIndex = 0 // reset search
    }
    
    // 3. Process remaining lines
    const lines = tempText.split('\n')
    let currentTableLines: string[] = []
    
    const flushTable = () => {
      if (currentTableLines.length > 0) {
        blocks.push({
          type: 'table',
          content: currentTableLines.join('\n')
        })
        currentTableLines = []
      }
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // Check placeholders
      if (trimmed.startsWith('___BLOCK_CODE_') && trimmed.endsWith('___')) {
        flushTable()
        const ph = placeholders.find(p => p.placeholder === trimmed)
        if (ph) blocks.push(ph.token)
        continue
      }
      if (trimmed.startsWith('___BLOCK_MATH_') && trimmed.endsWith('___')) {
        flushTable()
        const ph = placeholders.find(p => p.placeholder === trimmed)
        if (ph) blocks.push(ph.token)
        continue
      }
      
      // Table rows
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        currentTableLines.push(line)
        continue
      } else {
        flushTable()
      }
      
      if (trimmed === '') {
        continue
      }
      
      // Blockquotes
      if (trimmed.startsWith('>')) {
        blocks.push({
          type: 'blockquote',
          content: trimmed.replace(/^>\s*/, '')
        })
        continue
      }
      
      // Headers
      if (trimmed.startsWith('#')) {
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
        if (headerMatch) {
          blocks.push({
            type: 'header',
            level: headerMatch[1].length,
            content: headerMatch[2]
          })
          continue
        }
      }
      
      // Lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s+/.test(trimmed)) {
        blocks.push({
          type: 'list',
          content: line
        })
        continue
      }
      
      // Paragraph
      blocks.push({
        type: 'paragraph',
        content: line
      })
    }
    
    flushTable()
    return blocks
  }

  function renderInline(text: string) {
    // 1. Split by bold **text**
    const boldParts = text.split(/\*\*(.*?)\*\*/g)
    
    return boldParts.map((boldPart, boldIndex) => {
      const isBold = boldIndex % 2 === 1
      
      // 2. Split by inline code `code`
      const codeParts = boldPart.split(/`(.*?)`/g)
      const renderedCodeParts = codeParts.map((codePart, codeIndex) => {
        const isCode = codeIndex % 2 === 1
        
        if (isCode) {
          return (
            <code key={codeIndex} className="px-1.5 py-0.5 bg-vx-surface border border-vx-border/40 rounded text-vx-purple font-mono text-xs font-semibold">
              {codePart}
            </code>
          )
        }
        
        // 3. Split by links [label](url)
        const linkParts = codePart.split(/\[(.*?)\]\((.*?)\)/g)
        const renderedLinkParts: React.ReactNode[] = []
        
        for (let l = 0; l < linkParts.length; l += 3) {
          if (linkParts[l]) {
            renderedLinkParts.push(
              <LatexRenderer key={`txt-${l}`} text={linkParts[l]} />
            )
          }
          if (l + 2 < linkParts.length) {
            const label = linkParts[l + 1]
            const url = linkParts[l + 2]
            renderedLinkParts.push(
              <a 
                key={`link-${l}`} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-vx-purple hover:underline font-semibold"
              >
                <LatexRenderer text={label} />
              </a>
            )
          }
        }
        
        return <React.Fragment key={codeIndex}>{renderedLinkParts}</React.Fragment>
      })
      
      if (isBold) {
        return (
          <strong key={boldIndex} className="font-bold text-vx-purple">
            {renderedCodeParts}
          </strong>
        )
      }
      return <React.Fragment key={boldIndex}>{renderedCodeParts}</React.Fragment>
    })
  }

  function renderTable(tableText: string) {
    const lines = tableText.split('\n').map(l => l.trim()).filter(l => l !== '')
    if (lines.length === 0) return null
    
    // Headers parsing
    const headers = lines[0]
      .split('|')
      .map(s => s.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    
    // Rows parsing, skip delimiter row (lines[1])
    const rows = lines.slice(2).map(line => {
      return line
        .split('|')
        .map(s => s.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    })
    
    return (
      <div className="overflow-x-auto my-3 border border-vx-border/40 rounded-lg">
        <table className="min-w-full text-xs text-left text-vx-text-secondary">
          <thead className="bg-vx-surface/60 text-[10px] font-bold uppercase text-vx-purple border-b border-vx-border/40">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="px-4 py-2 font-semibold">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-vx-border/20">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-vx-surface/20">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-2">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function formatMessageContent(content: string) {
    const blocks = parseBlocks(content)
    const elements: React.ReactNode[] = []
    
    let currentListItems: React.ReactNode[] = []
    
    const flushList = (key: string) => {
      if (currentListItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="space-y-1 my-2">
            {currentListItems}
          </ul>
        )
        currentListItems = []
      }
    }

    blocks.forEach((block, idx) => {
      if (block.type === 'list') {
        const trimmed = block.content.trim()
        const isNumbered = /^\d+\.\s+/.test(trimmed)
        let cleanText = trimmed
        if (isNumbered) {
          cleanText = trimmed.replace(/^\d+\.\s+/, '')
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          cleanText = trimmed.substring(2)
        }
        
        currentListItems.push(
          <li key={`li-${idx}`} className="ml-4 list-disc mb-0.5 leading-relaxed text-sm text-vx-text-secondary">
            {renderInline(cleanText)}
          </li>
        )
      } else {
        flushList(String(idx))
        
        if (block.type === 'header') {
          const level = block.level || 2
          const classes = "font-bold text-vx-text my-3 " + (
            level === 1 ? "text-lg border-b border-vx-border/30 pb-1" :
            level === 2 ? "text-md text-vx-purple" : "text-sm text-vx-purple/80"
          )
          elements.push(
            React.createElement(`h${level}`, { key: idx, className: classes }, renderInline(block.content))
          )
        } else if (block.type === 'code') {
          elements.push(
            <pre key={idx} className="p-3 bg-vx-surface border border-vx-border/40 rounded-lg font-mono text-xs overflow-x-auto my-2 text-vx-text-secondary">
              <code className="text-vx-purple">{block.content}</code>
            </pre>
          )
        } else if (block.type === 'display-math') {
          elements.push(
            <div key={idx} className="my-3 overflow-x-auto">
              <LatexRenderer text={`\\[${block.content}\\]`} />
            </div>
          )
        } else if (block.type === 'table') {
          elements.push(
            <div key={idx}>
              {renderTable(block.content)}
            </div>
          )
        } else if (block.type === 'blockquote') {
          elements.push(
            <blockquote key={idx} className="pl-4 border-l-2 border-vx-border/60 text-vx-text-secondary/80 italic my-2">
              {renderInline(block.content)}
            </blockquote>
          )
        } else if (block.type === 'paragraph') {
          elements.push(
            <p key={idx} className="mb-2 leading-relaxed text-sm text-vx-text-secondary min-h-[1em]">
              {renderInline(block.content)}
            </p>
          )
        }
      }
    })
    
    flushList('end')
    return elements
  }

  return (
    <div className="mt-4 glass-card overflow-hidden flex flex-col">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-vx-surface/40 border-b border-vx-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vx-purple to-vx-blue flex items-center justify-center text-white shadow-lg shadow-vx-purple/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-vx-text">VidyaX AI Tutor</h4>
            <p className="text-[10px] text-vx-muted">GATE Student Mistake Analyzer</p>
          </div>
        </div>
        <span className="text-[10px] bg-vx-purple/10 border border-vx-purple/20 text-vx-purple px-2.5 py-0.5 rounded-full font-semibold">
          AI Help
        </span>
      </div>

      {/* Messages Feed */}
      <div className="p-4 max-h-[300px] overflow-y-auto space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
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
                  <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-br from-vx-purple to-vx-blue flex items-center justify-center text-white">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-vx-text text-sm ${
                    isUser
                      ? 'bg-vx-surface border border-vx-border rounded-tr-sm'
                      : 'bg-vx-graphite/80 border border-vx-border/40 rounded-tl-sm'
                  }`}
                >
                  <div>{formatMessageContent(msg.content)}</div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 flex-shrink-0 rounded-full bg-vx-surface border border-vx-border flex items-center justify-center text-vx-text-secondary">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {loading && (
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
              Thinking...
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-vx-border/40 bg-vx-graphite/30 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask AI Tutor for explanation or clarity..."
          className="input-glass flex-1 text-xs py-2.5 px-3"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-lg bg-gradient-to-br from-vx-purple to-vx-blue text-white disabled:opacity-40 flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </motion.button>
      </form>
    </div>
  )
}
