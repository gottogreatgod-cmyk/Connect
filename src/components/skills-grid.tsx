'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Clapperboard,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Search,
  Volume2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type Skill = {
  icon: LucideIcon
  title: string
  description: string
  live?: boolean
}

const SKILLS: Skill[] = [
  {
    icon: MessageSquare,
    title: 'AI Chat',
    description:
      'Conversational assistants with multi-turn context, system prompts, and streaming-friendly completions.',
    live: true,
  },
  {
    icon: ImageIcon,
    title: 'Image Generation',
    description:
      'Create custom artwork, illustrations, and product visuals from text prompts in seconds.',
    live: true,
  },
  {
    icon: Volume2,
    title: 'Text to Speech',
    description:
      'Turn any text into natural-sounding speech with multiple voices, speeds, and audio formats.',
  },
  {
    icon: Mic,
    title: 'Speech Recognition',
    description:
      'Transcribe user audio into accurate text for voice input, commands, and accessibility.',
  },
  {
    icon: Eye,
    title: 'Vision (VLM)',
    description:
      'Understand images — descriptions, visual Q&A, and reasoning over photos and screenshots.',
  },
  {
    icon: Clapperboard,
    title: 'Video Generation',
    description:
      'Generate engaging video content from text prompts for marketing and creative campaigns.',
  },
  {
    icon: Search,
    title: 'Web Search',
    description:
      'Retrieve up-to-the-minute information from across the web with real-time search results.',
  },
  {
    icon: BookOpen,
    title: 'Page Reader',
    description:
      'Extract clean, structured content from any web page for research and aggregation.',
  },
]

export function SkillsGrid() {
  return (
    <section id="skills" className="scroll-mt-16" aria-labelledby="skills-heading">
      <div className="container mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="skills-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            The Skills Toolkit
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every capability is a drop-in Skill, called from your backend with a
            single SDK. No API keys to juggle, no vendor lock-in.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((skill, i) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.08 }}
            >
              <Card className="group h-full border-border/80 transition-all hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/15 dark:text-emerald-400">
                      <skill.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    {skill.live && (
                      <Badge
                        variant="secondary"
                        className="gap-1.5 border border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-700 dark:text-emerald-300"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        Live demo
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold">{skill.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {skill.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
