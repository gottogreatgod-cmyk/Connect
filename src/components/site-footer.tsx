import { Sparkles } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Studio',
    links: ['Module library', 'AI Copilot', 'Two design paths', 'Save & load pages'],
  },
  {
    title: 'Playbook',
    links: ['344 modules', '20 sections', 'Tier matrix', 'Production rules'],
  },
  {
    title: 'AI Skills',
    links: ['Chat · Images', 'Search · Vision', 'Speech · Audio', 'Video generation'],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto w-full max-w-[100rem] px-4 py-10 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-semibold">AI Website Studio</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A self-customizable website creator: the Modules Playbook, eight AI skills, and two
              design paths for every module — orchestrated from a single brief.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-muted-foreground">{link}</span>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AI Website Studio. Built with Next.js 16 and
            z-ai-web-dev-sdk.
          </p>
          <p className="text-xs text-muted-foreground">
            Every AI feature on this page runs on live models.
          </p>
        </div>
      </div>
    </footer>
  )
}
