'use client'

import React, { useEffect, useState } from 'react'

interface LatexRendererProps {
  text: string
  className?: string
}

declare global {
  interface Window {
    katex?: {
      renderToString: (tex: string, options?: any) => string
    }
  }
}

export default function LatexRenderer({ text, className = '' }: LatexRendererProps) {
  const [katexLoaded, setKatexLoaded] = useState(false)

  useEffect(() => {
    // Check if KaTeX stylesheet is already present
    if (!document.getElementById('katex-css')) {
      const link = document.createElement('link')
      link.id = 'katex-css'
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'
      document.head.appendChild(link)
    }

    // Check if KaTeX JS script is already loaded
    if (window.katex) {
      setKatexLoaded(true)
      return
    }

    const scriptId = 'katex-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js'
      script.async = true
      document.body.appendChild(script)
    }

    const handleLoad = () => setKatexLoaded(true)
    script.addEventListener('load', handleLoad)

    return () => {
      script.removeEventListener('load', handleLoad)
    }
  }, [])

  if (!katexLoaded || !window.katex) {
    // Fallback: strip LaTeX delimiters for simple readability until KaTeX loads
    const cleaned = text.replace(/\\\(|\\\)|\\\[|\\\]/g, '')
    return <span className={className}>{cleaned}</span>
  }

  try {
    const katex = window.katex
    const parts: React.ReactNode[] = []
    let lastIndex = 0

    // Match \[ ... \] or \\[ ... \\] (display math) and \( ... \) or \\( ... \\) (inline math)
    const regex = /\\{1,2}\[([\s\S]*?)\\{1,2}\]|\\{1,2}\(([\s\S]*?)\\{1,2}\)/g
    let match

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex))
      }

      const displayMath = match[1]
      const inlineMath = match[2]
      const isDisplay = displayMath !== undefined
      const mathContent = isDisplay ? displayMath : inlineMath

      try {
        const html = katex.renderToString(mathContent, {
          displayMode: isDisplay,
          throwOnError: false,
        })
        parts.push(
          <span
            key={matchIndex}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      } catch (err) {
        console.error('KaTeX rendering error:', err)
        parts.push(match[0])
      }

      lastIndex = regex.lastIndex
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return <span className={className}>{parts}</span>
  } catch (e) {
    console.error('LatexRenderer parsing error:', e)
    return <span className={className}>{text}</span>
  }
}
