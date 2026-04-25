'use client'

import { motion } from 'framer-motion'
import { MessageSquare, RotateCcw, Palette, Tag, Layers, Quote, Share2 } from 'lucide-react'
import { BrandDNA, PlatformStrategy } from '@/types/brand'

interface DNAResultProps {
  dna: BrandDNA
  onStartChat: () => void
  onReset: () => void
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.4 } },
}

function PlatformIcon({ platform }: { platform: PlatformStrategy['platform'] }) {
  const cls = 'w-4 h-4'
  if (platform === 'LinkedIn') return <Share2 className={cls} />
  if (platform === 'Instagram') return <Share2 className={cls} />
  return <Share2 className={cls} />   // ← antes era <Facebook />
}


export default function DNAResult({ dna, onStartChat, onReset }: DNAResultProps) {
  const { brandProfile: bp, contentStrategy: cs } = dna

  return (
    <div className="min-h-screen bg-black pb-24 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto pt-16 flex flex-col gap-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <p className="text-xs text-zinc-600 mb-1">{bp.url}</p>
            <h1 className="text-3xl font-semibold text-white">{bp.name}</h1>
            <p className="text-zinc-500 mt-1 text-sm">{bp.industry}</p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-1"
          >
            <RotateCcw size={13} />
            New URL
          </button>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">

          {/* Tagline + description */}
          <motion.div variants={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Quote size={13} />
              Tagline & Voice
            </div>
            <p className="text-white font-medium text-lg">"{bp.tagline}"</p>
            <p className="text-zinc-400 text-sm leading-relaxed">{bp.description}</p>
          </motion.div>

          {/* Brand metadata grid */}
          <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card label="Archetype" value={bp.archetype} icon={<Layers size={14} />} />
            <Card label="Tone" value={bp.tone.join(', ')} icon={<Tag size={14} />} />
            <Card
              label="Values"
              value={bp.values.slice(0, 3).join(' · ')}
              icon={<Tag size={14} />}
              className="col-span-2 sm:col-span-1"
            />
          </motion.div>

          {/* Color palette */}
          <motion.div variants={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Palette size={13} />
              Color Palette
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {bp.colors.map((color) => (
                <div key={color.hex} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-10 h-10 rounded-xl border border-white/10 shadow-lg"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-zinc-500 font-mono">{color.hex}</span>
                  <span className="text-[10px] text-zinc-600">{color.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Platform strategies */}
          <motion.div variants={item} className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500 px-1">
              <Layers size={13} />
              Platform Strategies
            </div>
            <div className="flex flex-col gap-3">
              {cs.platforms.map((p) => (
                <div
                  key={p.platform}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <PlatformIcon platform={p.platform} />
                    {p.platform}
                  </div>
                  <p className="text-zinc-400 text-sm">{p.tone}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                    <Detail label="Length" value={p.postLength} />
                    <Detail label="CTA" value={p.cta} />
                    <Detail label="Hashtags" value={p.hashtagStrategy} />
                    <Detail label="Visual ratio" value={p.visualRatio} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.contentTypes.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[11px] text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Guidelines */}
          <motion.div variants={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
            <div className="text-xs text-zinc-500">General Guidelines</div>
            <ul className="flex flex-col gap-2">
              {cs.generalGuidelines.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </motion.div>

        </motion.div>
      </div>

      {/* Sticky CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-0 inset-x-0 flex justify-center pb-6 px-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pointer-events-none"
      >
        <button
          onClick={onStartChat}
          className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
        >
          <MessageSquare size={16} />
          Chat with your Brand DNA
        </button>
      </motion.div>
    </div>
  )
}

function Card({
  label,
  value,
  icon,
  className,
}: {
  label: string
  value: string
  icon: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-1.5 ${className ?? ''}`}>
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">{icon}{label}</div>
      <p className="text-sm text-zinc-300 leading-snug">{value}</p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-zinc-600">{label}: </span>
      <span className="text-zinc-400">{value}</span>
    </div>
  )
}
