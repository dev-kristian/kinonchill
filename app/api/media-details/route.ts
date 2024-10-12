import { NextResponse } from 'next/server'

const TMDB_API_KEY = process.env.NEXT_PRIVATE_TMDB_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mediaType = searchParams.get('mediaType')
  const id = searchParams.get('id')

  if (!mediaType || !['movie', 'tv', 'person'].includes(mediaType)) {
    return NextResponse.json({ error: 'Invalid mediaType parameter' }, { status: 400 })
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const url = `https://api.themoviedb.org/3/${mediaType}/${id}?language=en-US`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${mediaType} details from TMDB`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching ${mediaType} details from TMDB:`, error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}