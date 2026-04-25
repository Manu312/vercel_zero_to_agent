'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Palette, Brain, BarChart3, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import { ProcessingStep } from '@/types/brand'

interface ProcessingViewProps {
  url: string
  onComplete: () => void
}

interface Step {
  id: ProcessingStep
  icon: React.ReactNode
  title: string
  description: string
  duration: number // ms
}

const STEPS: Step[] = [
  {
    id: 'scraping',
    icon: <Globe size={20} />,
    title: 'Scanning website',
    description: 'Fetching DOM, copy and metadata from the URL',
    duration: 2200,
  },
  {
    id: 'colors',
    icon: <Palette size={20} />,
    title: 'Extracting color palette',
    description: 'Analyzing CSS, OG tags and visual assets',
    duration: 1800,
  },
  {
    id: 'dna',
    icon: <Brain size={20} />,
    title: 'Running DNA analysis',
    description: 'Identifying tone, values, archetype and brand voice',
    duration: 2500,
  },
  {
    id: 'strategy',
    icon: <BarChart3 size={20} />,
    title: 'Building content strategy',
    description: 'Matching brand profile with platform best practices',
    duration: 2000,
  },
]

const TOTAL_DURATION = STEPS.reduce((acc, s) => acc + s.duration, 0)

export default function ProcessingView({ url, onComplete }: ProcessingViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<ProcessingStep[]>([])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let elapsed = 0
    const intervals: NodeJS.Timeout[] = []

    STEPS.forEach((step, i) => {
      const delay = STEPS.slice(0, i).reduce((acc, s) => acc + s.duration, 0)

      const startTimer = setTimeout(() => {
        setCurrentStepIndex(i)
      }, delay)

      const endTimer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id])
        elapsed += step.duration
      }, delay + step.duration)

      intervals.push(startTimer, endTimer)
    })

    const doneTimer = setTimeout(() => {
      setDone(true)
      setTimeout(onComplete, 800)
    }, TOTAL_DURATION + 200)

    intervals.push(doneTimer)

    // Progress bar
    const start = Date.now()
    const progressInterval = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / TOTAL_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) clearInterval(progressInterval)
    }, 50)

    return () => {
      intervals.forEach(clearInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  const hostname = (() => {
    try { return new URL(url).hostname } catch { return url }
  })()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg flex flex-col gap-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Analyzing
          </div>
          <h2 className="text-xl font-medium text-white">
            Extracting DNA from{' '}
            <span className="text-blue-400">{hostname}</span>
          </h2>
          <p className="text-zinc-600 text-sm">This takes about {Math.ceil(TOTAL_DURATION / 1000)} seconds</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {STEPS.map((step, i) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = currentStepIndex === i && !isCompleted
            const isPending = currentStepIndex < i

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={clsx(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all duration-300',
                  isCompleted && 'border-white/10 bg-white/[0.03]',
                  isCurrent && 'border-blue-500/30 bg-blue-500/5',
                  isPending && 'border-white/5 bg-transparent'
                )}
              >
                <div
                  className={clsx(
                    'mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                    isCompleted && 'bg-green-500/10 text-green-400',
                    isCurrent && 'bg-blue-500/10 text-blue-400',
                    isPending && 'bg-zinc-800 text-zinc-600'
                  )}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : step.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'text-sm font-medium',
                        isCompleted && 'text-zinc-300',
                        isCurrent && 'text-white',
                        isPending && 'text-zinc-600'
                      )}
                    >
                      {step.title}
                    </span>
                    {isCurrent && (
                      <span className="flex gap-0.5">
                        {[0, 1, 2].map((j) => (
                          <motion.span
                            key={j}
                            className="w-1 h-1 rounded-full bg-blue-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                  <p
                    className={clsx(
                      'text-xs mt-0.5',
                      isCompleted && 'text-zinc-500',
                      isCurrent && 'text-zinc-400',
                      isPending && 'text-zinc-700'
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Done state */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center text-sm text-green-400 font-medium"
            >
              ✓ Brand DNA extracted successfully
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
