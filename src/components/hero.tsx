'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
  }),
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.5_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0_0/0.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]" />
        <div className="absolute -top-24 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/15" />
        <div className="absolute top-24 -left-24 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-400/10" />
        <div className="absolute top-40 -right-24 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10" />
      </div>

      <div className="container mx-auto flex max-w-5xl flex-col items-center px-4 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Powered by z-ai-web-dev-sdk
          </Badge>
        </motion.div>

        <motion.h1
          id="hero-heading"
          custom={0.1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl"
        >
          Add{' '}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400">
            AI Superpowers
          </span>{' '}
          to Your Website
        </motion.h1>

        <motion.p
          custom={0.2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          Eight production-ready AI Skills — chat, image generation, speech,
          vision, search and more — wired into your app through one simple
          backend SDK. Try the live demos below, running on real models right
          now.
        </motion.p>

        <motion.div
          custom={0.3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Button
            size="lg"
            className="w-full gap-2 sm:w-auto"
            onClick={() =>
              document
                .getElementById('demos')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            Try the Live Demos
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={() =>
              document
                .getElementById('skills')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Explore Skills
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </motion.div>

        <motion.dl
          custom={0.4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-12 grid w-full max-w-2xl grid-cols-3 gap-4"
        >
          {[
            { value: '8', label: 'AI Skills' },
            { value: '1', label: 'Backend SDK' },
            { value: '0', label: 'API Keys to Manage' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card/60 p-4 backdrop-blur-sm"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                {stat.value}
              </dd>
              <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}
