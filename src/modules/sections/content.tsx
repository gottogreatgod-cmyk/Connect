import { useId, useState } from 'react'
import { ChevronDown, Clock } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading } from '@/modules/ui/primitives'

interface Faq {
  question: string
  answer: string
}

interface FaqAccordionProps {
  title: string
  faqs: Faq[]
}

export function FaqAccordion({ title, faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0)
  const baseId = useId()

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-display text-3xl leading-[1.2] text-stone-900 md:text-4xl">{title}</h2>
          <ul className="mt-10">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              const panelId = `${baseId}-panel-${index}`
              return (
                <li key={faq.question} className="border-b border-stone-200">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                  >
                    <span className="text-base font-medium text-stone-900">{faq.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-stone-500 transition-transform duration-300 motion-reduce:transition-none ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p id={panelId} className="pb-6 pr-10 text-sm leading-[1.6] text-stone-700">
                      {faq.answer}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </Container>
    </section>
  )
}

interface FaqSpreadProps {
  title: string
  faqs: Faq[]
}

export function FaqSpread({ title, faqs }: FaqSpreadProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <h2 className="mx-auto max-w-2xl text-center font-display text-3xl leading-[1.2] text-stone-900 md:text-4xl">{title}</h2>
        <dl className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-800 text-xs font-bold text-white"
                >
                  Q
                </span>
                <span className="text-base font-bold leading-snug text-stone-900">{faq.question}</span>
              </dt>
              <dd className="mt-2 pl-9 text-sm leading-[1.6] text-stone-700">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

interface Article {
  category: string
  heading: string
  excerpt: string
  readTime: string
  imageUrl: string
  imageAlt: string
}

interface ArticleFeaturedProps {
  eyebrow: string
  title: string
  articles: Article[]
}

function ArticleMeta({ article }: { article: Article }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="rounded-full bg-emerald-800/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900">
        {article.category}
      </span>
      <span className="inline-flex items-center gap-1.5 text-sm text-stone-600">
        <Clock className="h-4 w-4" aria-hidden="true" />
        {article.readTime}
      </span>
    </p>
  )
}

export function ArticleFeatured({ eyebrow, title, articles }: ArticleFeaturedProps) {
  const [featured, ...rest] = articles

  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <article className="mt-12">
          <img
            src={featured.imageUrl}
            alt={featured.imageAlt}
            loading="lazy"
            className="aspect-[21/9] w-full rounded-3xl object-cover"
          />
          <div className="mt-6 max-w-3xl">
            <ArticleMeta article={featured} />
            <h3 className="mt-4 font-display text-3xl leading-[1.15] text-stone-900">{featured.heading}</h3>
            <p className="mt-3 text-base leading-[1.5] text-stone-700">{featured.excerpt}</p>
          </div>
        </article>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {rest.map((article) => (
            <article key={article.heading}>
              <img
                src={article.imageUrl}
                alt={article.imageAlt}
                loading="lazy"
                className="aspect-[16/10] w-full rounded-2xl object-cover"
              />
              <div className="mt-5">
                <ArticleMeta article={article} />
                <h3 className="mt-3 text-xl font-semibold leading-snug text-stone-900">{article.heading}</h3>
                <p className="mt-2 text-sm leading-[1.5] text-stone-600">{article.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

interface ArticleRowsProps {
  eyebrow: string
  title: string
  articles: Article[]
}

export function ArticleRows({ eyebrow, title, articles }: ArticleRowsProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ul className="mt-12 divide-y divide-stone-200 border-y border-stone-200">
          {articles.map((article) => (
            <li key={article.heading} className="flex gap-5 py-6 transition-colors hover:bg-stone-50 sm:gap-8">
              <img
                src={article.imageUrl}
                alt={article.imageAlt}
                loading="lazy"
                className="aspect-[4/3] w-24 shrink-0 rounded-xl object-cover sm:w-40"
              />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-800">{article.category}</span>
                  <span className="inline-flex items-center gap-1 text-stone-500">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {article.readTime}
                  </span>
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-stone-900">{article.heading}</h3>
                <p className="mt-1.5 text-sm leading-[1.5] text-stone-600">{article.excerpt}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

const IRONLINE_ARTICLES: Article[] = [
  {
    category: 'Training',
    heading: 'Why progressive overload beats motivation',
    excerpt:
      'Motivation gets you through the door; a plan that adds a little weight each week keeps you there. Here is how we programme it for members in their first year.',
    readTime: '6 min read',
    imageUrl: 'https://picsum.photos/seed/ironline-article-1/940/650',
    imageAlt: 'A barbell loaded with small plates resting on a lifting platform',
  },
  {
    category: 'Recovery',
    heading: 'Soreness, sleep and when to actually rest',
    excerpt:
      'Not all soreness means progress. We break down the difference between productive fatigue and a warning sign, and what we tell members to do about each.',
    readTime: '5 min read',
    imageUrl: 'https://picsum.photos/seed/ironline-article-2/940/650',
    imageAlt: 'A foam roller and kettlebells set down beside a gym bench',
  },
  {
    category: 'Nutrition',
    heading: 'Protein without the spreadsheet',
    excerpt:
      'A simple plate method we hand to members who refuse to weigh food, plus the two habits that matter more than any supplement.',
    readTime: '4 min read',
    imageUrl: 'https://picsum.photos/seed/ironline-article-3/940/650',
    imageAlt: 'A lunch box with rice, vegetables and sliced chicken on a gym bag',
  },
  {
    category: 'Technique',
    heading: 'Squat depth, explained without the arguments',
    excerpt:
      'Hip structure, not attitude, decides how deep you can go safely. What our coaches look for instead of a tape measure.',
    readTime: '7 min read',
    imageUrl: 'https://picsum.photos/seed/ironline-article-4/940/650',
    imageAlt: 'A coach watching a member squat inside a rack at Ironline Strength',
  },
]

const IRONLINE_FAQS: Faq[] = [
  {
    question: 'I have never lifted before. Is Ironline still for me?',
    answer:
      'Yes. Every membership starts with a coached onboarding block where we teach the core lifts at a weight you control. Around half of our members had no training background when they joined.',
  },
  {
    question: 'How big are the classes?',
    answer:
      'Classes are capped at twelve people, with one coach leading and one floating to correct technique. That ratio is the whole point of the studio, so we never quietly grow the classes.',
  },
  {
    question: 'What does a membership include?',
    answer:
      'Unlimited classes, open-gym access from 06:00 to 22:00, a quarterly movement assessment, and programming you can follow in the app between sessions. There is no joining fee and no lock-in contract.',
  },
  {
    question: 'Can I pause my membership?',
    answer:
      'Yes. You can freeze your membership for up to eight weeks a year, and we hold your place in your usual class times while you are away. Just tell the front desk a week before you travel.',
  },
  {
    question: 'Is there anywhere to park?',
    answer:
      'There are twelve spaces behind the studio and free street parking after 18:00. The 14 bus stops directly outside if you are coming without a car.',
  },
]

export const contentModules: ModuleDefinition[] = [
  {
    id: 'faq-accordion',
    name: 'FAQ accordion',
    section: 'content',
    tier: 'Starter',
    purpose: 'Answers to the questions that block conversion, without scrolling fatigue.',
    rule: 'Every answer must be able to stand alone in search results — write full sentences, not fragments.',
    variants: [
      {
        id: 'a',
        label: 'Accordion',
        description: 'Collapsed questions that expand one at a time on demand.',
        component: FaqAccordion,
        defaults: {
          title: 'Questions we hear at the front desk',
          faqs: IRONLINE_FAQS,
        },
      },
      {
        id: 'b',
        label: 'Q&A spread',
        description: 'All questions and answers visible in a two-column grid — SEO-first.',
        component: FaqSpread,
        defaults: {
          title: 'Questions we hear at the front desk',
          faqs: IRONLINE_FAQS,
        },
      },
    ],
  },
  {
    id: 'article-teaser',
    name: 'Article teaser',
    section: 'content',
    tier: 'Growth',
    purpose: 'Latest articles or resources proving you publish what you practice.',
    rule: 'Show category and reading time — they set expectations before the click.',
    variants: [
      {
        id: 'a',
        label: 'Featured story',
        description: 'One large editorial card leading the section.',
        component: ArticleFeatured,
        defaults: {
          eyebrow: 'From the coaching floor',
          title: 'Notes from the gym floor',
          articles: IRONLINE_ARTICLES.slice(0, 3),
        },
        imageProps: ['articles[].imageUrl'],
      },
      {
        id: 'b',
        label: 'Media rows',
        description: 'Horizontal thumbnail-and-text rows — a reading list.',
        component: ArticleRows,
        defaults: {
          eyebrow: 'From the coaching floor',
          title: 'Notes from the gym floor',
          articles: IRONLINE_ARTICLES,
        },
        imageProps: ['articles[].imageUrl'],
      },
    ],
  },
]