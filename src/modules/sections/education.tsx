import { BookOpen, Clock } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading } from '@/modules/ui/primitives'

interface Course {
  title: string
  level: string
  lessons: string
  duration: string
  blurb: string
}

interface CourseListProps {
  eyebrow: string
  title: string
  courses: Course[]
}

interface CurriculumProps extends CourseListProps {
  intro: string
}

/** Level labels must sit on a real ladder; unknown levels fall back to a neutral pill. */
const levelStyles: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-900',
  Intermediate: 'bg-amber-100 text-amber-900',
  Advanced: 'bg-stone-800 text-white',
}
const levelFallback = 'bg-stone-100 text-stone-700'

export function CourseCards({ eyebrow, title, courses }: CourseListProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <article key={course.title} className="flex flex-col rounded-2xl border bg-white p-6">
              <p
                className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold ${
                  levelStyles[course.level] ?? levelFallback
                }`}
              >
                {course.level}
              </p>
              <h3 className="mt-4 text-lg font-semibold text-stone-900">{course.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-[1.6] text-stone-600">{course.blurb}</p>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
                <p className="flex items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    {course.lessons} lessons
                  </span>
                  <span aria-hidden="true" className="text-stone-300">
                    ·
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {course.duration}
                  </span>
                </p>
                <a
                  href="#courses"
                  className="text-sm font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-4"
                >
                  View course
                </a>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function CurriculumList({ eyebrow, title, intro, courses }: CurriculumProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
        <ol className="mx-auto mt-12 max-w-2xl">
          {courses.map((course, index) => (
            <li key={course.title} className="flex gap-5 border-b py-5 last:border-0">
              <span className="w-10 shrink-0 font-display text-2xl text-emerald-800" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-stone-900">{course.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{course.level}</p>
                <p className="mt-2 text-sm leading-[1.6] text-stone-600">{course.blurb}</p>
              </div>
              <p className="shrink-0 text-sm text-stone-500">{course.lessons} lessons</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

const COURSES: Course[] = [
  {
    title: 'Foundations of the Modern Web',
    level: 'Beginner',
    lessons: '24',
    duration: '8 weeks',
    blurb:
      'HTML, CSS and JavaScript from first principles. You finish by shipping a responsive portfolio site and a small interactive app.',
  },
  {
    title: 'React in Production',
    level: 'Intermediate',
    lessons: '32',
    duration: '10 weeks',
    blurb:
      'Components, state and data fetching against real APIs. You build and deploy a full-stack dashboard with tests and CI.',
  },
  {
    title: 'Systems & Scaling',
    level: 'Advanced',
    lessons: '18',
    duration: '6 weeks',
    blurb:
      'Caching, queues and database design under load. You take a real service from 100 to 10,000 requests a second.',
  },
]

export const educationModules: ModuleDefinition[] = [
  {
    id: 'course-list',
    name: 'Course list',
    section: 'education',
    tier: 'Growth',
    purpose: 'Courses with the facts students compare: level, length and what they will build.',
    rule: 'Level labels must match a real ladder (Beginner/Intermediate/Advanced). Lesson counts, not vague "hours".',
    variants: [
      {
        id: 'a',
        label: 'Course cards',
        description: 'Card per course with level badge, lessons, duration and outcome.',
        component: CourseCards,
        defaults: {
          eyebrow: 'Live cohorts',
          title: 'Courses starting this term',
          courses: COURSES,
        },
      },
      {
        id: 'b',
        label: 'Curriculum list',
        description: 'An ordered syllabus with module numbers and lesson counts — depth on display.',
        component: CurriculumList,
        defaults: {
          eyebrow: 'The syllabus',
          title: 'The programme, module by module',
          intro:
            'Every cohort is taught live, capped at 20 students and recorded for life. The order below is exactly how we teach it.',
          courses: COURSES,
        },
      },
    ],
  },
]
