'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RotateCcw, Dna, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { BrandDNA, ChatMessage } from '@/types/brand'
import { sendChatMessage } from '@/lib/api'
import ReactMarkdown from 'react-markdown'

interface ChatViewProps {
  dna: BrandDNA
  onReset: () => void
  onBackToDNA: () => void
}

const SUGGESTED_PROMPTS = [
  'Write a LinkedIn post for our next product launch',
  'Generate an Instagram caption with our brand voice',
  'What tone should we use for Facebook ads?',
  'Suggest hashtag strategy for all platforms',
  'How should we use our brand colors in content?',
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-500"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function ChatView({ dna, onReset, onBackToDNA }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `I've analyzed **${dna.brandProfile.name}'s** brand DNA. Your archetype is **${dna.brandProfile.archetype}** with a ${dna.brandProfile.tone.slice(0, 2).join(', ').toLowerCase()} voice.\n\nI can help you generate content for LinkedIn, Instagram, or Facebook — or answer anything about your brand strategy. What do you need?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function handleSend(text?: string) {
    const content = text ?? input.trim()
    if (!content || isLoading) return

    setInput('')

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const reply = await sendChatMessage(content, messages, dna)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <button
          onClick={onBackToDNA}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Dna size={15} />
          <span>{dna.brandProfile.name}</span>
          <ChevronRight size={13} className="text-zinc-700" />
          <span className="text-zinc-400">Chat</span>
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <RotateCcw size={12} />
          New URL
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={clsx(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-zinc-900 border border-white/10 text-zinc-300 rounded-bl-sm'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-zinc-900 border border-white/10 rounded-2xl rounded-bl-sm">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggested prompts (only when first message visible) */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2"
        >
          <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
            {SUGGESTED_PROMPTS.slice(0, 3).map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="shrink-0 px-4 pb-6 pt-2 bg-gradient-to-t from-black to-transparent">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-blue-500/40 transition-all"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your brand strategy..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={clsx(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
              input.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            )}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
