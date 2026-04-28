'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppPhase, BrandDNA } from '@/types/brand'
import URLInput from '@/components/URLInput'
import ProcessingView from '@/components/ProcessingView'
import DNAResult from '@/components/DNAResult'
import ChatView from '@/components/ChatView'
import { extractDNA } from '@/lib/api'

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>('landing')
  const [url, setUrl] = useState('')
  const [dna, setDna] = useState<BrandDNA | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleURLSubmit(submittedUrl: string) {
    setUrl(submittedUrl)
    setError(null)
    setPhase('processing')
    setDna(null)

    try {
      const result = await extractDNA(submittedUrl)
      setDna(result)
      setPhase('result')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo analizar la URL. Intentá de nuevo.'
      setError(message)
      setPhase('landing')
    }
  }

  function handleProcessingComplete() {
    // DNA should already be ready (mock is fast), but wait just in case
    if (dna) {
      setPhase('result')
    } else {
      // Retry every 200ms until DNA arrives
      const check = setInterval(() => {
        if (dna) {
          clearInterval(check)
          setPhase('result')
        }
      }, 200)
    }
  }

  function handleReset() {
    setPhase('landing')
    setUrl('')
    setDna(null)
    setError(null)
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <URLInput onSubmit={handleURLSubmit} error={error} />
        </motion.div>
      )}

      {phase === 'processing' && (
        <motion.div
          key="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ProcessingView url={url} onComplete={handleProcessingComplete} />
        </motion.div>
      )}

      {phase === 'result' && dna && (
        <motion.div
          key="result"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DNAResult
            dna={dna}
            onStartChat={() => setPhase('chat')}
            onReset={handleReset}
          />
        </motion.div>
      )}

      {phase === 'chat' && dna && (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <ChatView
            dna={dna}
            onReset={handleReset}
            onBackToDNA={() => setPhase('result')}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
