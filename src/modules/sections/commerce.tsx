import { ShoppingBag } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading, buttonSecondary, eyebrowClass } from '@/modules/ui/primitives'

/** buttonPrimary sized down for use inside dense cards (py-2 / text-xs). */
const buttonPrimarySm =
  'inline-flex items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2'

interface Product {
  name: string
  price: string
  badge: string
  description: string
  imageUrl: string
  imageAlt: string
}

interface ProductGridProps {
  eyebrow: string
  title: string
  products: Product[]
}

export function ProductGridCards({ eyebrow, title, products }: ProductGridProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <article key={product.name} className="flex flex-col overflow-hidden rounded-2xl border bg-white">
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                {product.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-emerald-800 px-2.5 py-1 text-xs font-semibold text-white">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold text-stone-900">{product.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-[1.5] text-stone-600">{product.description}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <p className="font-display text-xl text-stone-900">{product.price}</p>
                  <button type="button" className={buttonPrimarySm}>
                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                    Add to basket
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function ProductEditorialRows({ eyebrow, title, products }: ProductGridProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-6">
          {products.map((product, index) => (
            <div
              key={product.name}
              className="grid items-center gap-10 border-b py-10 last:border-0 md:grid-cols-2"
            >
              <div className={index % 2 === 1 ? 'md:order-2' : undefined}>
                <img
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  className="aspect-[4/3] w-full rounded-3xl object-cover shadow-sm"
                  loading="lazy"
                />
              </div>
              <div>
                {product.badge && <p className={eyebrowClass}>{product.badge}</p>}
                <h3 className="mt-3 font-display text-3xl leading-[1.15] text-stone-900">{product.name}</h3>
                <p className="mt-4 text-base leading-[1.6] text-stone-700">{product.description}</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <p className="font-display text-2xl text-emerald-900">{product.price}</p>
                  <button type="button" className={buttonSecondary}>
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    Add to basket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export const commerceModules: ModuleDefinition[] = [
  {
    id: 'product-grid',
    name: 'Product grid',
    section: 'commerce',
    tier: 'Growth',
    purpose: 'A browsable catalogue of products with prices and a clear add-to-basket path.',
    rule: 'Prices with currency, badges that mean something (Bestseller, New), and an add action visible without hovering.',
    variants: [
      {
        id: 'a',
        label: 'Product cards',
        description: 'Catalogue cards: image, badge, name, price, add — built for scanning.',
        component: ProductGridCards,
        defaults: {
          eyebrow: 'The roastery shelf',
          title: 'This week at Ember & Oak',
          products: [
            {
              name: 'Ember House Blend',
              price: '£14.50',
              badge: 'Bestseller',
              description:
                'Milk chocolate, toasted hazelnut and a soft caramel finish. Our everyday cup, roasted every Monday in 12 kg batches.',
              imageUrl: 'https://picsum.photos/seed/coffee-1/940/650',
              imageAlt: 'A kraft bag of Ember House Blend coffee on a roastery bench',
            },
            {
              name: 'Oak Single Origin — Huila, Colombia',
              price: '£17.00',
              badge: 'New',
              description:
                'Washed heirloom from 1,800 m: blackcurrant, cane sugar and a crisp apple acidity. Best brewed as a pour-over.',
              imageUrl: 'https://picsum.photos/seed/coffee-2/940/650',
              imageAlt: 'A scoop of single-origin coffee beans resting in a wooden bowl',
            },
            {
              name: 'Swiss Water Decaf',
              price: '£15.50',
              badge: '',
              description:
                'Sweet, plummy and gentle — all the comfort of our house style with none of the caffeine. 250 g, whole bean.',
              imageUrl: 'https://picsum.photos/seed/coffee-3/940/650',
              imageAlt: 'A bag of decaf coffee beside a French press',
            },
          ],
        },
      },
      {
        id: 'b',
        label: 'Editorial rows',
        description: 'One product per row, alternating image and copy — for considered, higher-ticket buying.',
        component: ProductEditorialRows,
        defaults: {
          eyebrow: 'The roastery shelf',
          title: 'This week at Ember & Oak',
          products: [
            {
              name: 'Kenya Gatomboya AA',
              price: '£19.00',
              badge: 'Limited batch',
              description:
                'Bright, juicy and unapologetic: blackcurrant and grapefruit with a long sugary finish. Roasted on Thursdays, gone by Sunday.',
              imageUrl: 'https://picsum.photos/seed/coffee-4/940/650',
              imageAlt: 'An open bag of Kenya Gatomboya AA coffee beans beside a cupping bowl',
            },
            {
              name: 'Ember & Oak Cold Brew Kit',
              price: '£32.00',
              badge: 'New',
              description:
                'Everything for cold brew at home: a one-litre filter flask, 20 papers and a 500 g bag of our cold-brew blend. Steep overnight, pour over ice.',
              imageUrl: 'https://picsum.photos/seed/coffee-5/940/650',
              imageAlt: 'A cold brew kit with a glass flask and a bag of coffee on a kitchen counter',
            },
          ],
        },
      },
    ],
  },
]
