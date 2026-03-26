import { NextResponse } from 'next/server'
import { generateLlmsFullTxt, DEFAULT_PAGES } from '@/lib/geo'

export const GET = () => {
  const content = generateLlmsFullTxt(DEFAULT_PAGES)

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
