import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading, eyebrowClass } from '@/modules/ui/primitives'

interface MenuItem {
  name: string
  description: string
  price: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

interface MenuClassicProps {
  title: string
  intro: string
  sections: MenuSection[]
}

export function MenuClassicSections({ title, intro, sections }: MenuClassicProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading title={title} intro={intro} />
        <div className="mt-14 grid gap-x-16 gap-y-14 lg:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className={eyebrowClass}>{section.title}</h3>
              <ul className="mt-6 space-y-7">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <div className="flex items-baseline gap-3">
                      <span className="text-base font-medium text-stone-900">{item.name}</span>
                      <span aria-hidden="true" className="flex-1 border-b border-dotted border-stone-300" />
                      <span className="font-display text-base tabular-nums text-stone-900">{item.price}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-[1.5] text-stone-500">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

interface MenuTastingProps {
  title: string
  intro: string
  sections: MenuSection[]
}

export function MenuTastingList({ title, intro, sections }: MenuTastingProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <SectionHeading title={title} intro={intro} />
          <div className="mt-14 space-y-14">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="flex items-center gap-6">
                  <span aria-hidden="true" className="h-px flex-1 bg-stone-300" />
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{section.title}</h3>
                  <span aria-hidden="true" className="h-px flex-1 bg-stone-300" />
                </div>
                <ul className="mt-7">
                  {section.items.map((item, index) => (
                    <li key={item.name} className="flex items-baseline gap-4 py-3">
                      <span className="font-display text-sm tabular-nums text-emerald-800">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="min-w-0 flex-1 text-base leading-[1.5] text-stone-500">
                        <span className="font-medium text-stone-900">{item.name}</span>
                        <span> — {item.description}</span>
                      </p>
                      <span className="font-display text-base tabular-nums text-stone-900">{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

const OSTERIA_FIORE_MENU: MenuSection[] = [
  {
    title: 'Antipasti',
    items: [
      {
        name: 'Focaccia di Recco',
        description: 'Twice-baked flatbread, stracchino, sea salt',
        price: '$9',
      },
      {
        name: 'Burrata & blood orange',
        description: 'Pistachio, honey, a crack of aged pepper',
        price: '$16',
      },
      {
        name: 'Crocchette',
        description: 'Potato and taleggio croquettes, rosemary salt',
        price: '$11',
      },
      {
        name: 'Little gems',
        description: 'Anchovy dressing, aged parmesan, lemon',
        price: '$10',
      },
    ],
  },
  {
    title: 'Pasta',
    items: [
      {
        name: 'Tagliatelle al ragù',
        description: 'Six-hour beef and pork ragù, parmesan',
        price: '$26',
      },
      {
        name: 'Cacio e pepe',
        description: 'Tonnarelli, pecorino, pepper — finished at the table',
        price: '$22',
      },
      {
        name: 'Ricotta ravioli',
        description: 'Sage and hazelnut brown butter',
        price: '$24',
      },
    ],
  },
  {
    title: 'Secondi',
    items: [
      {
        name: 'Brasato al Barolo',
        description: 'Barolo-braised beef, soft polenta, gremolata',
        price: '$34',
      },
      {
        name: 'Orata al forno',
        description: 'Whole roasted sea bream, lemon, salmoriglio',
        price: '$31',
      },
      {
        name: 'Melanzane alla parmigiana',
        description: 'Aubergine, tomato, fior di latte, basil',
        price: '$21',
      },
    ],
  },
]

export const hospitalityModules: ModuleDefinition[] = [
  {
    id: 'menu-board',
    name: 'Menu board',
    section: 'hospitality',
    tier: 'Growth',
    purpose: 'The menu as a browsable, appetising page section — not a PDF link.',
    rule: 'Prices aligned and honest; descriptions short enough to scan while hungry.',
    variants: [
      {
        id: 'a',
        label: 'Classic sections',
        description: 'Menu groups with dotted-leader price columns — the format guests know.',
        component: MenuClassicSections,
        defaults: {
          title: 'The menu this month',
          intro:
            'A short list that follows the market — the bread and pasta are made in-house every day, and prices include service.',
          sections: OSTERIA_FIORE_MENU,
        },
      },
      {
        id: 'b',
        label: 'Tasting list',
        description: 'Numbered minimal lines without boxes — fine-dining restraint.',
        component: MenuTastingList,
        defaults: {
          title: 'The menu this month',
          intro: 'A short list that follows the market. Tell us about allergies before you order and we will adapt any plate.',
          sections: OSTERIA_FIORE_MENU,
        },
      },
    ],
  },
]
