/**
 * The Universal Skill Registry — one agent-agnostic surface for every
 * capability in the merged system.
 *
 * Two kinds of skill live here, side by side:
 *
 *   kind: "motion" — 19 skills distilled from the five master animation
 *     sources (Emil Kowalski, GSAP, Remotion, Wiggle, iArt AI). Each one
 *     carries its principles and runnable recipes in plain text, so ANY
 *     agent — Claude, GPT, LangChain, n8n, a local model — can consume and
 *     execute them with zero vendor lock-in. No SKILL.md dialect required.
 *
 *   kind: "ai" — the 8 live AI skills, exposed through this system's own
 *     REST endpoints. Any external agent doesn't need the SDK or a model
 *     key: it calls OUR API and the unified layer does the rest.
 *
 * Served in three formats at /api/skills:
 *   ?format=json    — the full registry (default)
 *   ?format=tools   — OpenAI-style function/tool manifest
 *   ?format=md      — agent-system-prompt markdown
 */

import { CURVES, SPRINGS, DURATIONS, PERSONALITIES, GATE_TIERS, PURPOSES, FPS_CONTRACT, TIMELINE_GRAMMAR, LOTTIE_EASE } from './motion-craft'

/* ── types ─────────────────────────────────────────────────────────── */

export interface Recipe {
  title: string
  lang: 'tsx' | 'css' | 'js' | 'json'
  code: string
}

export interface UnifiedSkill {
  id: string
  kind: 'motion' | 'ai'
  name: string
  /** repo label + url for motion skills; engine label for ai skills */
  source: { label: string; url: string }
  category: 'foundation' | 'feel' | 'choreography' | 'brand' | 'interface' | 'video' | 'ai-engine'
  blurb: string
  /** ai skills only — this system's REST endpoint */
  endpoint?: string
  mode?: 'sync' | 'job'
  /** motion skills only — the distilled rules */
  principles?: string[]
  /** motion skills only — runnable code */
  recipes?: Recipe[]
  /** motion skills only — interactive demo id in the Motion Lab */
  demo?: string
  /** what runs it in this system, right now */
  runtime: string
}

/* ── the five master sources ───────────────────────────────────────── */

export const SKILL_SOURCES = [
  {
    id: 'emil',
    label: 'Emil Kowalski — animate',
    url: 'https://github.com/emilkowalski/skills',
    note: 'The gate, the feel system, entrance/exit recipes. The bar every animation here must clear.',
    accent: '#e11d48',
  },
  {
    id: 'gsap',
    label: 'GreenSock — GSAP',
    url: 'https://github.com/greensock/gsap-skills',
    note: 'Timeline choreography, position parameter, stagger sweeps, scroll-driven timelines.',
    accent: '#0a9396',
  },
  {
    id: 'remotion',
    label: 'Remotion — video in React',
    url: 'https://github.com/remotion-dev/skills',
    note: 'Composition thinking: sequenced tracks, springs as first-class values, render pipeline.',
    accent: '#8848ee',
  },
  {
    id: 'wiggle',
    label: 'Wiggle — logo motion',
    url: 'https://github.com/talknerdytome-labs/wiggle-claude-skill',
    note: 'Brand personality → motion type. Lottie keyframe grammar. The wiggle itself.',
    accent: '#f59e0b',
  },
  {
    id: 'iart',
    label: 'iArt AI — web animation',
    url: 'https://github.com/iart-ai/web-animation-skills',
    note: 'Micro-interactions, page transitions, glassmorphism, the 60fps contract.',
    accent: '#2563eb',
  },
] as const

export type SkillSourceId = (typeof SKILL_SOURCES)[number]['id']

const src = (id: SkillSourceId) => {
  const s = SKILL_SOURCES.find((x) => x.id === id)!
  return { label: s.label, url: s.url }
}

/* ── motion skills — the distillation ──────────────────────────────── */

export const MOTION_SKILLS: UnifiedSkill[] = [
  /* ————— Emil Kowalski ————— */
  {
    id: 'emil.gate',
    kind: 'motion',
    name: 'The Animate Gate',
    source: src('emil'),
    category: 'foundation',
    blurb: 'Should this animate at all? The first question, asked in the order that determines whether motion feels right.',
    principles: [
      `Frequency tiers: ${GATE_TIERS.map((t) => `${t.frequency} → ${t.decision}`).join(' · ')}`,
      'Keyboard-initiated actions are a disqualifier, not a judgment call.',
      'Name the purpose in one word before continuing: ' + PURPOSES.map((p) => p.split(' —')[0]).join(', ') + ". Can't name it? Don't build it.",
      'Cheapest tool that works: CSS transition → @starting-style → CSS animation → WAAPI → spring library. Never install a motion library for a fade.',
      'Zero lines of code is a success, not a dodge.',
    ],
    recipes: [
      {
        title: 'The gate as a decision function',
        lang: 'js',
        code: `function shouldAnimate(usesPerDay, purpose) {
  if (usesPerDay >= 100) return null            // no animation, ever
  if (!purpose) return null                     // unnamed purpose — stop
  if (usesPerDay >= 10) return { ms: 120 }      // near-imperceptible
  if (usesPerDay >= 3) return { ms: 200 }       // standard
  return { ms: 500, delight: true }             // rare — the delight budget
}`,
      },
    ],
    runtime: 'Applied at build time in this system — the OS motion nuke (prefers-reduced-motion + the global toggle) hard-gates every module.',
  },
  {
    id: 'emil.feel',
    kind: 'motion',
    name: 'The Feel System — curves, durations, springs',
    source: src('emil'),
    category: 'feel',
    blurb: 'The exact values, never approximated. Built-in easings are too weak; these are the ones that survive review.',
    principles: [
      ...CURVES['ease-out'].note.split('\n'),
      'Easing decision order: enter/exit → ease-out · on-screen movement → ease-in-out · hover/color → ease · constant → linear · default → ease-out. Never ease-in on UI.',
      `Duration ceiling: UI stays under 300ms. ${DURATIONS.map((d) => `${d.id}: ${d.ms[0]}–${d.ms[1]}ms`).join(' · ')}`,
      'Springs when the user can interrupt: gestures, drag with momentum, elements that should feel alive.',
      'A 180ms dropdown feels more responsive than a 400ms one. Ease-out at 200ms feels faster than ease-in at 200ms.',
    ],
    recipes: [
      {
        title: 'The tokens (drop into any design system)',
        lang: 'css',
        code: `:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);     /* strong ease-out — UI */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* on-screen movement */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);  /* iOS-like sheets */
  --dur-press: 130ms;
  --dur-menu: 200ms;
  --dur-modal: 320ms;
}`,
      },
      {
        title: 'Springs for interruptible motion',
        lang: 'tsx',
        code: `// Apple-style — easier to reason about
<motion.div transition={{ type: "spring", duration: 0.5, bounce: 0.2 }} />
// Snappy UI default (iArt)
<motion.button whileTap={{ scale: 0.96 }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }} />`,
      },
    ],
    demo: 'feel',
    runtime: 'engine/motion-craft.ts — CURVES · DURATIONS · SPRINGS, served to any agent via /api/skills.',
  },
  {
    id: 'emil.recipes',
    kind: 'motion',
    name: 'Entrances, Exits & Stagger',
    source: src('emil'),
    category: 'interface',
    blurb: 'The common cases as ready-to-build recipes — modal, dropdown, toast, accordion, stagger, hold-to-confirm, tab indicator.',
    principles: [
      'Nothing enters from scale(0) — start at scale(0.9–0.97) + opacity 0. Nothing in the real world appears from nothing.',
      'transform-origin at the trigger for popovers and menus; modals are exempt (they are not anchored, so they stay centered).',
      'Exit the way it entered — symmetric paths are what make swipe-to-dismiss feel obvious.',
      'Transitions, not keyframes, for anything a user can fire twice in a second — transitions retarget, keyframes restart from zero.',
      'Everything entering at once is a defect: 30–80ms stagger.',
      'Asymmetric timing where the user is deciding: slow deliberate phase, snappy system response.',
    ],
    recipes: [
      {
        title: 'Enter/exit with AnimatePresence (toasts)',
        lang: 'tsx',
        code: `<AnimatePresence mode="popLayout">
  {toasts.map((t) => (
    <motion.li key={t.id} layout
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
      {t.text}
    </motion.li>
  ))}
</AnimatePresence>`,
      },
      {
        title: 'Stagger a list',
        lang: 'tsx',
        code: `<motion.ul initial="hidden" animate="show"
  variants={{
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  }}>
  {items.map((i) => (
    <motion.li key={i} variants={{
      hidden: { opacity: 0, y: 12 },
      show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } },
    }} />
  ))}
</motion.ul>`,
      },
    ],
    demo: 'presence',
    runtime: 'The site kit primitives — every factory template inherits these recipes through the kit modules.',
  },
  {
    id: 'emil.a11y-motion',
    kind: 'motion',
    name: 'Reduced Motion & Pointer Gating',
    source: src('emil'),
    category: 'foundation',
    blurb: 'Ships with the animation, never as a follow-up. Fewer and gentler — not zero.',
    principles: [
      'prefers-reduced-motion: keep opacity and color, drop transform-based movement.',
      'Gate :hover motion behind @media (hover: hover) and (pointer: fine) — touch fires false hovers on tap.',
      'Reduced motion means fewer and gentler animations — transitions that aid comprehension stay.',
      'The OS-wide motion nuke (a single toggle) is the system-level backstop.',
    ],
    recipes: [
      {
        title: 'The guard pair',
        lang: 'css',
        code: `@media (prefers-reduced-motion: reduce) {
  .move { transition: opacity .2s; /* keep opacity, drop the transform */ }
}
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: scale(1.02); }
}`,
      },
    ],
    runtime: 'useReducedMotion() in every kit module + the shell MotionPrefProvider nuke.',
  },

  /* ————— GSAP ————— */
  {
    id: 'gsap.core',
    kind: 'motion',
    name: 'GSAP Tweens & Transforms',
    source: src('gsap'),
    category: 'foundation',
    blurb: 'Single tweens done right — transforms and opacity only, defaults inherited, one timeline when there is more than one step.',
    principles: [
      'Animate transform and opacity only — they skip layout and paint and run on the GPU. width/height/margin/top/left trigger all three.',
      'Use defaults so child tweens inherit: gsap.to(el, { defaults: { duration: 0.5, ease: "power2.out" } }).',
      'Never chain with delay when a timeline can sequence — delays drift, timelines are auditable.',
      'x/y/scale/rotate as independent transforms — GSAP resolves them into one matrix, no fighting with CSS transform strings.',
    ],
    recipes: [
      {
        title: 'A single tween, the right way',
        lang: 'js',
        code: `import gsap from 'gsap'
gsap.to('.card', {
  y: -8, opacity: 1,            // transforms + opacity only
  duration: 0.35,
  ease: 'power2.out',           // matches the emil ease-out family
  overwrite: 'auto',            // retarget on repeat fire, don't stack
})`,
      },
    ],
    runtime: 'gsap@3.15 — installed in this system, live in the Motion Lab and the site kit modules.',
  },
  {
    id: 'gsap.timeline',
    kind: 'motion',
    name: 'Timeline Choreography',
    source: src('gsap'),
    category: 'choreography',
    blurb: 'The position parameter is the whole library in one idea: place every tween absolutely, relatively, or at a label.',
    principles: [
      ...TIMELINE_GRAMMAR.position.map((p) => `${p.token} — ${p.meaning}`),
      'Labels make timelines readable and scrubbable: tl.addLabel("intro") then tl.play("intro").',
      'Pass defaults into the timeline constructor — child tweens inherit duration and ease.',
      'Nest timelines inside timelines; a master timeline is still one scrub unit.',
      'Reverse is free: the exit is the entrance played backwards, from wherever it currently is.',
    ],
    recipes: [
      {
        title: 'A three-act hero build',
        lang: 'js',
        code: `const tl = gsap.timeline({
  defaults: { duration: 0.6, ease: 'power3.out' },
})
tl.addLabel('curtain')
  .from('.veil', { scaleY: 1 }, 'curtain')
  .from('.hero-title', { y: 40, opacity: 0 }, 'curtain+=0.15')
  .addLabel('cast')
  .from('.hero-sub', { y: 24, opacity: 0 }, 'cast')
  .from('.hero-cta', { scale: 0.94, opacity: 0 }, 'cast+=0.1')
  .addLabel('lights')
  .to('.veil', { opacity: 0, display: 'none' }, 'lights')
// scrubbable: tl.progress(0.5) · tl.play('cast') · tl.reverse()`,
      },
    ],
    demo: 'timeline',
    runtime: 'The Motion Lab timeline stage — scrub it by hand, then read the same grammar as text.',
  },
  {
    id: 'gsap.stagger',
    kind: 'motion',
    name: 'Stagger Sweeps',
    source: src('gsap'),
    category: 'choreography',
    blurb: 'Grids and lists as one gesture: each, from center, grid sweeps — the ripple is the choreography.',
    principles: [
      ...TIMELINE_GRAMMAR.stagger.map((s) => `${s.token} — ${s.meaning}`),
      '30–80ms apart is the sweet spot — faster reads as one block, slower reads as lag.',
      'from: "center" ripples outward; grid: [cols, rows] sweeps a matrix like light.',
    ],
    recipes: [
      {
        title: 'Grid sweep from center',
        lang: 'js',
        code: `gsap.from('.tile', {
  opacity: 0, scale: 0.92, y: 16,
  duration: 0.5, ease: 'power3.out',
  stagger: { grid: [3, 3], from: 'center', each: 0.06 },
})`,
      },
    ],
    demo: 'stagger-grid',
    runtime: 'StaggerGrid kit module — mounted on factory templates and live in the Lab.',
  },
  {
    id: 'gsap.scroll',
    kind: 'motion',
    name: 'Scroll-Driven Timelines',
    source: src('gsap'),
    category: 'choreography',
    blurb: 'The scrollbar becomes the playhead: pin, scrub, parallax — one timeline mapped to scroll progress.',
    principles: [
      'ScrollTrigger on the timeline (or top-level tween), never on tweens inside a timeline.',
      'scrub: true links playhead to scroll 1:1; scrub: 0.5 lags half a second behind — smoother feel.',
      'Pin the stage while the timeline plays underneath (pin: true) — the section becomes a theatre.',
      'Parallax is just two elements moving at different rates on the same scroll progress.',
    ],
    recipes: [
      {
        title: 'Pinned scrub section',
        lang: 'js',
        code: `gsap.timeline({
  scrollTrigger: {
    trigger: '.act', start: 'top top',
    end: '+=120%', scrub: 0.6, pin: true,
  },
})
  .to('.bg', { yPercent: -18, ease: 'none' }, 0)
  .from('.fg-copy', { yPercent: 30, opacity: 0 }, 0)
  .to('.counter', { innerText: 100, snap: { innerText: 1 } }, 0)`,
      },
    ],
    demo: 'scrolltrack',
    runtime: 'RevealOnScroll in the site kit (viewport-triggered) + the Lab parallax track (progress-driven).',
  },
  {
    id: 'gsap.perf',
    kind: 'motion',
    name: 'Animation Performance',
    source: src('gsap'),
    category: 'foundation',
    blurb: 'The 60fps contract — what is allowed to animate, what never is, and how to stay smooth while the page is busy.',
    principles: [
      ...FPS_CONTRACT.animateOnly.map((p) => `Animate only: ${p}`),
      `Never animate: ${FPS_CONTRACT.neverAnimate.join(', ')} — they trigger layout + paint + composite.`,
      'CSS animations run off the main thread — they beat JS while the page is loading. Use CSS for predetermined motion, JS for dynamic and interruptible motion.',
      'Batch scroll-driven work; never create a ScrollTrigger per list item when one trigger can drive the batch.',
      'Force GC-friendly cleanup: kill timelines on unmount in React (useGSAP handles it).',
    ],
    recipes: [
      {
        title: 'React cleanup with useGSAP',
        lang: 'tsx',
        code: `import { useGSAP } from '@gsap/react'
useGSAP(() => {
  gsap.from('.row', { y: 16, opacity: 0, stagger: 0.05 })
}, { scope: ref })   // auto-kills on unmount, no useEffect leaks`,
      },
    ],
    runtime: 'The Lab demos profile live — the fps meter beside each stage proves the contract.',
  },

  /* ————— Remotion ————— */
  {
    id: 'remotion.composition',
    kind: 'motion',
    name: 'Composition Thinking',
    source: src('remotion'),
    category: 'video',
    blurb: 'A video is a React component over time: Sequences are tracks, spring() is a first-class value, interpolate maps time to anything.',
    principles: [
      'Think in tracks, not tweens: every element is a Sequence with from/to — the timeline is the composition tree.',
      'spring() is a value like any other: const scale = spring({ frame, fps, config: { damping: 12 } }).',
      'interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }) maps time → any domain.',
      'useCurrentFrame() is the single clock — one source of truth, deterministic, renderable server-side.',
      'If it can be drawn in the browser, it can be rendered to MP4 — the same code, two outputs.',
    ],
    recipes: [
      {
        title: 'A composition with sequenced tracks',
        lang: 'tsx',
        code: `export const Reel = () => {
  const frame = useCurrentFrame()
  const title = spring({ frame: frame - 10, fps: 30, config: { damping: 14 } })
  return (
    <>
      <Sequence from={0} durationInFrames={30}>
        <Curtain />
      </Sequence>
      <Sequence from={12}>
        <h1 style={{ transform: \`scale(\${title})\` }}>The Reel</h1>
      </Sequence>
      <Audio src={staticFile("bed.mp3")} />
    </>
  )
}`,
      },
    ],
    demo: 'compositor',
    runtime: 'The Motion Lab Compositor — remotion-style tracks with a live preview, in-browser.',
  },
  {
    id: 'remotion.markup',
    kind: 'motion',
    name: 'Markup Inside Video',
    source: src('remotion'),
    category: 'video',
    blurb: 'HTML-in-canvas craft: measuring text, cropping, light leaks, audio visualization — the details that make generated video feel produced.',
    principles: [
      'Measure text before layout — fontFamily metrics decide breaks; never eyeball a caption.',
      'Light leaks: a blurred gradient layer with screen blend — cheap cinema.',
      'Audio visualization is just interpolate over volume samples — bars, waveform rings, whatever the brand needs.',
      'Crop with overflow + transform, never by re-rendering a different frame.',
    ],
    recipes: [
      {
        title: 'Waveform bars from audio samples',
        lang: 'tsx',
        code: `const bars = useMemo(() =>
  samples.slice(0, 48).map((v, i) => ({
    height: interpolate(v, [0, 1], [8, 90], { clamp: true }),
    delay: i * 0.02,
  })), [samples])`,
      },
    ],
    runtime: 'Feeds the AI Studio video path — /api/ai/video generates; this skill styles what lands around it.',
  },
  {
    id: 'remotion.pipeline',
    kind: 'motion',
    name: 'Player & Render Pipeline',
    source: src('remotion'),
    category: 'video',
    blurb: 'One composition, two outputs: the Player plays it in the browser, the server renders it to MP4. The bridge to this system\'s video engine.',
    principles: [
      '@remotion/player plays compositions in the browser — zero render cost for previews.',
      'Server rendering is a job, not a request: queue it, poll it — exactly this system\'s /api/ai/video contract.',
      'Keep compositions deterministic: same frame in, same pixels out — that is what makes server render trustworthy.',
      'Progress events, not spinners: a render that takes 40s must narrate itself.',
    ],
    recipes: [
      {
        title: 'Job-mode contract (this system\'s pattern)',
        lang: 'js',
        code: `// POST /api/ai/video → { jobId }   (202, accepted instantly)
// GET  /api/ai/video?jobId=… → { status: 'pending' | 'done', video? }
// 2.5s poll · 180s ceiling — any 30s+ operation is a job, never a request.`,
      },
    ],
    runtime: 'The AI Studio video skill runs this exact pipeline today; the Compositor previews compositions live.',
  },

  /* ————— Wiggle ————— */
  {
    id: 'wiggle.philosophy',
    kind: 'motion',
    name: 'Motion Philosophy',
    source: src('wiggle'),
    category: 'brand',
    blurb: '30 seconds of philosophy before any keyframe: what personality does the brand have, what emotion should the motion evoke, what is the metaphor.',
    principles: [
      'Answer three questions before animating: personality (playful/professional/bold/elegant)? emotion (excitement/trust/curiosity)? metaphor (organic growth, mechanical precision, energetic burst)?',
      `Corporate: ${PERSONALITIES.corporate.keyframes} keyframes, ${PERSONALITIES.corporate.easing}, ${PERSONALITIES.corporate.fps}fps, ${PERSONALITIES.corporate.duration}.`,
      `Organic: ${PERSONALITIES.organic.keyframes}, ${PERSONALITIES.organic.easing}, ${PERSONALITIES.organic.fps}fps — dense keyframes at 60fps are what make it feel alive.`,
      `Bold: ${PERSONALITIES.bold.keyframes}, ${PERSONALITIES.bold.easing}, ${PERSONALITIES.bold.duration} — the entrance IS the brand voice.`,
      `Cinematic: ${PERSONALITIES.cinematic.keyframes} — time is the luxury signal. Slow means expensive.`,
      'Match motion to brand or don\'t ship it: corporate ≠ startup ≠ audio brand.',
    ],
    recipes: [
      {
        title: 'The personality table (as data)',
        lang: 'json',
        code: JSON.stringify(
          {
            corporate: { fps: 30, duration: '1.5-2s', ease: '0.42/0.58', keyframes: '8-12' },
            organic: { fps: 60, duration: '3s loop', ease: '0.25/0.75', keyframes: '25-45' },
            bold: { fps: 60, duration: '0.8-1.5s', ease: '0.34/1.56', keyframes: '15-25' },
            cinematic: { fps: 60, duration: '3-5s', ease: 'custom', keyframes: '50-120' },
          },
          null,
          2,
        ),
      },
    ],
    demo: 'personalities',
    runtime: 'engine/motion-craft.ts PERSONALITIES — the Lab renders all four live on one stage.',
  },
  {
    id: 'wiggle.text',
    kind: 'motion',
    name: 'The Wiggle — Text & Logo Motion',
    source: src('wiggle'),
    category: 'brand',
    blurb: 'The signature move: per-letter springs with phase offsets. A logo is text is a wave — same grammar at any size.',
    principles: [
      'Animate letters, not blocks: a per-letter phase offset (15–30 frames at 60fps) is what makes text feel designed.',
      'Never recreate text with drawing tools — extract the real glyphs, then transform them.',
      'Simultaneous entrance reads as one voice; staggered entrance (icon first, text +30 frames) tells a two-act story.',
      'Stagger guidance: 15 frames = subtle · 30 frames = noticeable sequence (most common) · 45 frames = dramatic two-act reveal.',
      'Perfect loops: last frame must equal first frame — validate or the loop visibly jumps.',
    ],
    recipes: [
      {
        title: 'Per-letter wave (the wiggle)',
        lang: 'tsx',
        code: `{'Growth'.split('').map((ch, i) => (
  <motion.span key={i}
    animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
    transition={{
      duration: 1.6, repeat: Infinity,
      delay: i * 0.07,              // the phase offset IS the wiggle
      ease: 'easeInOut', times: [0, 0.5, 1],
    }}>
    {ch}
  </motion.span>
))}`,
      },
      {
        title: 'Lottie keyframe pair (wiggle easing)',
        lang: 'json',
        code: JSON.stringify(
          {
            fr: 60,
            ip: 0,
            op: 180,
            layers: [
              {
                ind: 1,
                ty: 4,
                ks: {
                  r: {
                    a: 1,
                    k: [
                      { t: 0, s: [-5], e: [5], i: { x: [LOTTIE_EASE.organic.i], y: [1] }, o: { x: [LOTTIE_EASE.organic.o], y: [0] } },
                      { t: 90, s: [5] },
                    ],
                  },
                },
              },
            ],
          },
          null,
          2,
        ),
      },
    ],
    demo: 'wiggle-text',
    runtime: 'WiggleText kit module — the Lab stage and every factory hero can run it.',
  },
  {
    id: 'wiggle.lottie',
    kind: 'motion',
    name: 'Lottie Keyframe Grammar',
    source: src('wiggle'),
    category: 'brand',
    blurb: 'The JSON spec behind every logo animation: layers, animated properties, i/o tangents — readable by any tool that speaks Lottie.',
    principles: [
      'Structure: v/fr/ip/op/w/h then layers[] and assets[] — frame rate and in/out points first.',
      'Animated properties: o (opacity), p (position), s (scale), r (rotation), a (anchor) — a:1 means animated, k[] holds the keys.',
      'Keyframes: t (frame), s (start), e (end), i/o tangents — the easing lives in the tangents.',
      `Tangent pairs: ${Object.entries(LOTTIE_EASE).map(([k, v]) => `${k} ${v.i}/${v.o}`).join(' · ')}.`,
      'External assets ("e": 0) while developing; embed base64 only after rendering succeeds.',
      'File budgets: website hero 30–80KB JSON, email signature 20–50KB, splash 30–100KB.',
    ],
    recipes: [
      {
        title: 'Minimal valid Lottie with a fade',
        lang: 'json',
        code: `{
  "v": "5.7.4", "fr": 60, "ip": 0, "op": 90, "w": 512, "h": 512,
  "layers": [{
    "ind": 1, "ty": 4, "nm": "mark",
    "ks": {
      "o": { "a": 1, "k": [
        { "t": 0,  "s": [0],   "e": [100],
          "i": { "x": [0.42], "y": [1] },
          "o": { "x": [0.58], "y": [0] } },
        { "t": 45, "s": [100] }
      ] }
    }
  }]
}`,
      },
    ],
    runtime: 'Served as data — any Lottie player or render farm can consume it unchanged.',
  },

  /* ————— iArt AI ————— */
  {
    id: 'iart.micro',
    kind: 'motion',
    name: 'Micro-Interactions',
    source: src('iart'),
    category: 'interface',
    blurb: 'Hover, press, toggle, like, reorder — small functional motion that makes an interface feel responsive and alive.',
    principles: [
      'UI micro-interactions live in 100–250ms; anything over ~400ms feels laggy for a click response.',
      'Instant press feedback: scale 0.96 on tap with a fast spring (stiffness 400, damping 30).',
      'Asymmetric timing: enter slightly slower (ease-out), exit faster — arrive gracefully, leave promptly.',
      'Layout animation is the superpower: layout on a list item animates any position/size change through transforms.',
      'Shared elements: same layoutId on two components = magic move between them.',
      'State, not decoration: loading → success → error should be one continuous morph, not a jump cut.',
      'A plain layout element distorts border-radius and text during scale — use layout="position" or counter-scale the children.',
    ],
    recipes: [
      {
        title: 'The feedback trio',
        lang: 'tsx',
        code: `<motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.96 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
/>
<motion.li layout transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
<motion.div layoutId="hero-card" />  // shared element — magic move`,
      },
    ],
    demo: 'micro',
    runtime: 'MagneticButton + kit modules — live on factory templates and the Lab stage.',
  },
  {
    id: 'iart.transitions',
    kind: 'motion',
    name: 'Page Transitions',
    source: src('iart'),
    category: 'interface',
    blurb: 'The seam between views is a design surface: shared-axis slides, crossfades, exit-through-enter — continuity over teleporting.',
    principles: [
      'Spatial model: pages that sit "beside" each other slide on the shared axis; hierarchical pages push; peers crossfade.',
      'Exit-through-enter: the outgoing view leaves as the incoming one arrives — overlap, never a blank frame.',
      'Keep the chrome pinned: only the content region swaps, the header stays — that is what makes it feel like one place.',
      'Reduced motion: swap with a 120ms opacity fade, keep the spatial logic for screen readers.',
    ],
    recipes: [
      {
        title: 'Shared-axis swap',
        lang: 'tsx',
        code: `<AnimatePresence mode="wait" initial={false}>
  <motion.div key={route}
    initial={{ opacity: 0, x: dir * 24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: dir * -24 }}
    transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}>
    {page}
  </motion.div>
</AnimatePresence>`,
      },
    ],
    demo: 'transitions',
    runtime: 'The Lab transition stage — three styles, one click each.',
  },
  {
    id: 'iart.glass',
    kind: 'motion',
    name: 'Glassmorphism',
    source: src('iart'),
    category: 'interface',
    blurb: 'Depth without weight: backdrop blur, layered translucency, a 1px light border — the material, not a coating.',
    principles: [
      'The recipe: translucent fill (8–16% opacity), backdrop-blur 12–24px, saturate(140–180%), 1px inner light border, soft ambient shadow.',
      'Glass needs something behind it to refract — a gradient or photo, never flat white.',
      'Keep text at full opacity on glass; the material dims, the content must not.',
      'Motion on glass: scale + blur shifts read as focus/defocus of the pane itself.',
    ],
    recipes: [
      {
        title: 'The glass card',
        lang: 'css',
        code: `.glass {
  background: color-mix(in oklab, var(--bg) 60%, transparent);
  backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid color-mix(in oklab, white 14%, transparent);
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.12);
  border-radius: 18px;
}`,
      },
    ],
    demo: 'glass',
    runtime: 'GlassPanel kit module — used by the shell consoles and the Lab.',
  },
  {
    id: 'iart.60fps',
    kind: 'motion',
    name: 'The 60fps Contract',
    source: src('iart'),
    category: 'foundation',
    blurb: 'The performance constitution: what may animate, what never may, and how to profile it honestly.',
    principles: [
      ...FPS_CONTRACT.rules,
      'Profile in the Performance panel: long frames come from layout/paint, almost never from composite.',
      'A stagger that janks once at the start is a layout thrash — someone animated a property from the never list.',
    ],
    recipes: [
      {
        title: 'Transform-only parallax',
        lang: 'css',
        code: `.parallax { will-change: transform; }
@media (prefers-reduced-motion: no-preference) {
  .parallax { transform: translate3d(0, calc(var(--scroll) * -0.3), 0); }
}`,
      },
    ],
    runtime: 'Every kit module is audited against this contract; the Lab shows the fps meter live.',
  },
]

/* ── ai skills — the unified engine layer ──────────────────────────── */

export const AI_SKILL_ENTRIES: UnifiedSkill[] = [
  { id: 'ai.chat', kind: 'ai', name: 'AI Chat', source: { label: 'zai.chat · in-system engine', url: '/ai' }, category: 'ai-engine', blurb: 'Conversation and generation over text — reasoning, rewriting, structured output.', endpoint: '/api/ai/chat', mode: 'sync', runtime: 'POST messages[] → text. Streams via job mode for long generations.' },
  { id: 'ai.image', kind: 'ai', name: 'Image Generation', source: { label: 'zai.images · in-system engine', url: '/ai' }, category: 'ai-engine', blurb: 'Photographic art from prompts — heroes, marks, textures. 7 aspect ratios.', endpoint: '/api/ai/image', mode: 'job', runtime: 'Job mode: 202 {jobId} → poll GET ?jobId= until done (30–90s).' },
  { id: 'ai.tts', kind: 'ai', name: 'Text to Speech', source: { label: 'zai.audio.tts · in-system engine', url: '/ai' }, category: 'ai-engine', blurb: 'Natural spoken audio — voiceovers, greetings, IVR trees. 7 voices.', endpoint: '/api/ai/tts', mode: 'sync', runtime: 'POST text → base64 audio.' },
  { id: 'ai.asr', kind: 'ai', name: 'Speech Recognition', source: { label: 'zai.audio.asr · in-system engine', url: '/ai' }, category: 'ai-engine', blurb: 'Spoken language to text — microphone or file.', endpoint: '/api/ai/asr', mode: 'sync', runtime: 'POST base64 audio → transcript.' },
  { id: 'ai.vlm', kind: 'ai', name: 'Vision (VLM)', source: { label: 'glm-4.6v · in-system engine', url: '/ai' }, category: 'ai-engine', blurb: 'The model that reads images — critique, metadata, extraction.', endpoint: '/api/ai/vlm', mode: 'sync', runtime: 'POST image + prompt → structured analysis.' },
  { id: 'ai.video', kind: 'ai', name: 'Video Generation', source: { label: 'zai.video · in-system engine', url: '/ai' }, category: 'ai-engine', blurb: 'Motion from prompts — cinematic reels and social teasers.', endpoint: '/api/ai/video', mode: 'job', runtime: 'Job mode: 202 {jobId} → poll — the remotion.pipeline contract.' },
  { id: 'ai.search', kind: 'ai', name: 'Web Search', source: { label: 'zai.search · in-system engine', url: '/ai' }, category: 'ai-engine', blurb: 'Live web retrieval — competitor scans, visual research.', endpoint: '/api/ai/search', mode: 'sync', runtime: 'POST query → ranked results.' },
  { id: 'ai.reader', kind: 'ai', name: 'Page Reader', source: { label: 'zai.reader · in-system engine', url: '/ai' }, category: 'ai-engine', blurb: 'Web content extraction — inspiration, audits.', endpoint: '/api/ai/reader', mode: 'sync', runtime: 'POST url → clean text.' },
]

/* ── the unified surface ───────────────────────────────────────────── */

export const ALL_SKILLS: UnifiedSkill[] = [...MOTION_SKILLS, ...AI_SKILL_ENTRIES]

export const findSkill = (id: string) => ALL_SKILLS.find((s) => s.id === id)
