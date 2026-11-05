import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id')

    if (id) {
      const page = await db.pageComposition.findUnique({ where: { id } })
      if (!page) {
        return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
      }
      let modules: unknown = []
      try {
        modules = JSON.parse(page.modules)
      } catch {
        modules = []
      }
      return NextResponse.json({
        page: { id: page.id, name: page.name, modules },
      })
    }

    const pages = await db.pageComposition.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, updatedAt: true },
    })
    return NextResponse.json({ pages })
  } catch (error) {
    console.error('[api/pages GET]', error)
    return NextResponse.json({ error: 'Could not load pages.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string
      name?: string
      modules?: unknown
    }

    const name =
      typeof body.name === 'string' && body.name.trim().length > 0
        ? body.name.trim().slice(0, 120)
        : 'Untitled page'

    if (!Array.isArray(body.modules)) {
      return NextResponse.json({ error: 'modules must be an array.' }, { status: 400 })
    }

    const modules = JSON.stringify(body.modules)

    const page = body.id
      ? await db.pageComposition.update({
          where: { id: body.id },
          data: { name, modules },
        })
      : await db.pageComposition.create({
          data: { name, modules },
        })

    return NextResponse.json({
      page: { id: page.id, name: page.name, updatedAt: page.updatedAt },
    })
  } catch (error) {
    console.error('[api/pages POST]', error)
    return NextResponse.json({ error: 'Could not save the page.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'An id is required.' }, { status: 400 })
    }
    await db.pageComposition.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/pages DELETE]', error)
    return NextResponse.json({ error: 'Could not delete the page.' }, { status: 500 })
  }
}
