'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, Sparkles } from 'lucide-react'
import clsx from 'clsx'

interface URLInputProps {
  onSubmit: (url: string) => void
  error?: string | null
}

const EXAMPLE_URLS = [
  'vercel.com',
  'stripe.com',
  'linear.app',
  'notion.so',
]

export default function URLInput({ onSubmit, error }: URLInputProps) {
  const [url, setUrl] = useState('')
  const [focused, setFocused] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    const normalized = url.startsWith('http') ? url : `https://${url}`
    onSubmit(normalized)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-black">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-8"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-400"
        >
          <Sparkles size={12} className="text-blue-400" />
          Brand DNA Extractor
        </motion.div>

        {/* Headline */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
            Extract your brand's
            <span className="text-blue-400"> DNA</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-md mx-auto">
            Paste any URL and we'll analyze tone, colors, values and generate a full content strategy.
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="w-full">
          <div
            className={clsx(
              'flex items-center gap-3 w-full rounded-2xl border bg-zinc-900 px-4 py-3 transition-all duration-200',
              focused
                ? 'border-blue-500/50 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                : 'border-white/10 hover:border-white/20'
            )}
          >
            <Globe size={18} className="text-zinc-500 shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="https://yourbrand.com"
              className="flex-1 bg-transparent text-white placeholder:text-zinc-600 outline-none text-base"
              autoFocus
            />
            <button
              type="submit"
              disabled={!url.trim()}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                url.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              )}
            >
              Analyze
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Examples */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-xs text-zinc-600">Try:</span>
          {EXAMPLE_URLS.map((example) => (
            <button
              key={example}
              onClick={() => setUrl(example)}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
