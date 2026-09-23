import { NextRequest, NextResponse } from 'next/server'

function extractMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return match[1]
  }
  return null
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ title: null, description: null, image: null })
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WritematesBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    const html = await res.text()

    let title = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title')
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
      title = titleMatch ? titleMatch[1].trim() : null
    }

    const description = extractMeta(html, 'og:description') || extractMeta(html, 'description')

    let image = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image')
    if (image && !image.startsWith('http')) {
      const origin = new URL(url).origin
      image = image.startsWith('/') ? origin + image : origin + '/' + image
    }

    return NextResponse.json({ title, description, image })
  } catch {
    return NextResponse.json({ title: null, description: null, image: null })
  }
}
