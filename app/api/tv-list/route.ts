import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = process.env.NEXT_PRIVATE_TMDB_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { type, page } = await request.json()

    if (!type || (type !== 'popular' && type !== 'top_rated')) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    if (!TMDB_API_KEY) {
      console.error('TMDB API key is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const url = `https://api.themoviedb.org/3/tv/${type}?language=en-US&page=${page}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`TMDB API responded with status ${response.status}: ${errorText}`)
      throw new Error(`Failed to fetch ${type} TV shows data from TMDB`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in TV list API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}