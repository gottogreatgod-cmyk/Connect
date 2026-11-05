import { useState } from 'react'
import { CalendarCheck, Clock } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, FormField, SectionHeading, buttonPrimary } from '@/modules/ui/primitives'

const selectClass =
  'mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 transition-colors focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30'

interface Service {
  name: string
  duration: string
  price: string
}

interface ServicePickerProps {
  title: string
  intro: string
  services: Service[]
  dateLabel: string
  timeLabel: string
  submitLabel: string
  successMessage: string
}

interface RequestFormProps extends ServicePickerProps {
  note: string
}

const DAYS = ['Mon 12 May', 'Tue 13 May', 'Wed 14 May', 'Thu 15 May', 'Fri 16 May']
const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

export function BookingServicePicker({
  title,
  intro,
  services,
  dateLabel,
  timeLabel,
  submitLabel,
  successMessage,
}: ServicePickerProps) {
  const [selected, setSelected] = useState(0)
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading title={title} intro={intro} />
        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border p-8">
          {submitted ? (
            <div className="py-6 text-center" role="status">
              <CalendarCheck className="mx-auto h-12 w-12 text-emerald-700" aria-hidden="true" />
              <p className="mt-4 text-lg font-medium text-stone-900">{successMessage}</p>
              <p className="mt-2 text-sm text-stone-600">
                {services[selected]?.name} · {day} · {time}
              </p>
            </div>
          ) : (
            <>
              <ul className="grid gap-3">
                {services.map((service, index) => {
                  const isSelected = index === selected
                  return (
                    <li key={service.name}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelected(index)}
                        className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                            : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-medium text-stone-900">{service.name}</span>
                          <span className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {service.duration}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-stone-900">{service.price}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="booking-day" className="block text-sm font-medium text-stone-800">
                    {dateLabel}
                  </label>
                  <select id="booking-day" value={day} onChange={(event) => setDay(event.target.value)} className={selectClass}>
                    <option value="">Choose a day</option>
                    {DAYS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="booking-time" className="block text-sm font-medium text-stone-800">
                    {timeLabel}
                  </label>
                  <select id="booking-time" value={time} onChange={(event) => setTime(event.target.value)} className={selectClass}>
                    <option value="">Choose a time</option>
                    {TIMES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                disabled={!day || !time}
                onClick={() => setSubmitted(true)}
                className={`${buttonPrimary} mt-8 w-full disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {submitLabel}
              </button>
            </>
          )}
        </div>
      </Container>
    </section>
  )
}

export function BookingRequestForm({
  title,
  intro,
  services,
  dateLabel,
  timeLabel,
  submitLabel,
  successMessage,
  note,
}: RequestFormProps) {
  const [values, setValues] = useState({ name: '', phone: '', date: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const set = (key: 'name' | 'phone' | 'date' | 'message', value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }))

  const complete =
    values.name.trim() !== '' && values.phone.trim() !== '' && values.date.trim() !== '' && values.message.trim() !== ''

  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading title={title} intro={intro} />
        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border bg-white p-8">
          {submitted ? (
            <div className="py-6 text-center" role="status">
              <CalendarCheck className="mx-auto h-12 w-12 text-emerald-700" aria-hidden="true" />
              <p className="mt-4 text-lg font-medium text-stone-900">{successMessage}</p>
            </div>
          ) : (
            <>
              <ul className="grid gap-3 sm:grid-cols-3">
                {services.map((service) => (
                  <li key={service.name} className="rounded-xl border bg-white px-4 py-3">
                    <p className="text-sm font-medium text-stone-900">{service.name}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {service.duration} · {service.price}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid gap-5">
                <FormField
                  id="vr-name"
                  label="Your name"
                  value={values.name}
                  onChange={(value) => set('name', value)}
                  autoComplete="name"
                  required
                />
                <FormField
                  id="vr-phone"
                  label="Phone"
                  type="tel"
                  value={values.phone}
                  onChange={(value) => set('phone', value)}
                  autoComplete="tel"
                  hint={timeLabel}
                  required
                />
                <FormField
                  id="vr-date"
                  label={dateLabel}
                  type="date"
                  value={values.date}
                  onChange={(value) => set('date', value)}
                  required
                />
                <FormField
                  id="vr-message"
                  label="What do you have in mind?"
                  value={values.message}
                  onChange={(value) => set('message', value)}
                  multiline
                  required
                />
              </div>
              <p className="mt-5 text-xs text-stone-500">{note}</p>
              <button
                type="button"
                disabled={!complete}
                onClick={() => setSubmitted(true)}
                className={`${buttonPrimary} mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {submitLabel}
              </button>
            </>
          )}
        </div>
      </Container>
    </section>
  )
}

const SERVICES: Service[] = [
  { name: 'Cut & finish', duration: '45 min', price: 'from £48' },
  { name: 'Full colour', duration: '2 hrs', price: 'from £95' },
  { name: 'Occasion styling', duration: '1 hr', price: 'from £65' },
]

export const bookingModules: ModuleDefinition[] = [
  {
    id: 'booking-panel',
    name: 'Booking panel',
    section: 'booking',
    tier: 'Growth',
    purpose: 'Turn intent into an appointment: pick a service, pick a slot, confirm.',
    rule: 'Never ask for details the salon fills in at the chair. Show duration and price before the slot.',
    variants: [
      {
        id: 'a',
        label: 'Service picker',
        description: 'Service cards with duration and price, then a date/time selector and confirm.',
        component: BookingServicePicker,
        defaults: {
          title: 'Book your visit',
          intro: 'Choose a service, pick a day that suits, and we will confirm by text within the hour.',
          services: SERVICES,
          dateLabel: 'Preferred day',
          timeLabel: 'Preferred time',
          submitLabel: 'Confirm booking',
          successMessage: 'Booking received — we have pencilled you in and will text to confirm within the hour.',
        },
      },
      {
        id: 'b',
        label: 'Request form',
        description: 'A message-first request for flexible, relationship-led bookings.',
        component: BookingRequestForm,
        defaults: {
          title: 'Request an appointment',
          intro: 'Not sure which service you need? Tell us what you have in mind and we will suggest one and find a time that works.',
          services: SERVICES,
          dateLabel: 'Preferred date',
          timeLabel: 'We only call between 09:00 and 16:00, Tuesday to Saturday.',
          submitLabel: 'Send request',
          successMessage: 'Thank you — your request is with the salon. We will be in touch to arrange a time.',
          note: 'Appointments are held for 10 minutes past your slot. Cancellations are free up to 24 hours before.',
        },
      },
    ],
  },
]
