'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Image as ImageIcon, Terminal } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChatDemo } from '@/components/chat-demo'
import { ImageDemo } from '@/components/image-demo'

const CODE_SNIPPET = `// app/api/chat/route.ts — a working AI endpoint in ~10 lines
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const zai = await ZAI.create()

  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  })

  return Response.json({
    content: completion.choices[0].message.content,
  })
}`

export function DemosSection() {
  return (
    <section
      id="demos"
      className="scroll-mt-16 border-t bg-muted/20"
      aria-labelledby="demos-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="demos-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Live Demos, Real Models
          </h2>
          <p className="mt-4 text-muted-foreground">
            These aren&apos;t mockups — every response below is generated live
            by the same backend SDK you can use in your own app.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="mt-12"
        >
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="mx-auto grid h-auto w-full max-w-md grid-cols-2">
              <TabsTrigger value="chat" className="gap-2 py-2.5">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="image" className="gap-2 py-2.5">
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                Image Generation
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 grid gap-6 lg:grid-cols-5">
              <Card className="min-w-0 lg:col-span-3">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    Try it yourself
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TabsContent value="chat" className="mt-0">
                    <ChatDemo />
                  </TabsContent>
                  <TabsContent value="image" className="mt-0">
                    <ImageDemo />
                  </TabsContent>
                </CardContent>
              </Card>

              <Card className="min-w-0 bg-zinc-950 text-zinc-50 dark:bg-zinc-900">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Terminal
                        className="h-4 w-4 text-emerald-400"
                        aria-hidden="true"
                      />
                      How it works
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="border border-zinc-700 bg-zinc-800 text-zinc-300"
                    >
                      Backend only
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-zinc-400">
                    One SDK call from an API route is all it takes. The skill
                    runs entirely server-side — your keys and the SDK never
                    reach the browser.
                  </p>
                  <pre className="min-w-0 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300">
                    <code>{CODE_SNIPPET}</code>
                  </pre>
                  <p className="mt-4 text-sm text-zinc-400">
                    Swap the skill —{' '}
                    <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400">
                      zai.images
                    </code>
                    ,{' '}
                    <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400">
                      zai.audio
                    </code>
                    ,{' '}
                    <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400">
                      zai.videos
                    </code>{' '}
                    — same pattern, new superpower.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}
