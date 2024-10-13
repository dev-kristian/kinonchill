import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = process.env.NEXT_PRIVATE_TMDB_API_KEY

export async function POST(request: NextRequest) {
  const { mediaType, timeWindow, page } = await request.json()

  if (!mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
    return NextResponse.json({ error: 'Invalid mediaType parameter' }, { status: 400 })
  }

  if (!timeWindow || (timeWindow !== 'day' && timeWindow !== 'week')) {
    return NextResponse.json({ error: 'Invalid timeWindow parameter' }, { status: 400 })
  }

  const url = `https://api.themoviedb.org/3/trending/${mediaType}/${timeWindow}?language=en-US&page=${page}`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TMDB_API_KEY}`,
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch trending data from TMDB for ${mediaType}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching trending ${mediaType} from TMDB:`, error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}