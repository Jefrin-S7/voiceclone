import { NextRequest, NextResponse } from 'next/server'
import { listVoices, deleteVoice } from '@/lib/elevenlabs'

// GET /api/voices — list all voices
export async function GET(req: NextRequest) {
  try {
    const voices = await listVoices()

    // Sort: cloned voices first, then premade
    const sorted = voices.sort((a, b) => {
      if (a.category === 'cloned' && b.category !== 'cloned') return -1
      if (a.category !== 'cloned' && b.category === 'cloned') return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({ voices: sorted })
  } catch (error: any) {
    console.error('[API /voices] GET Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voices' },
      { status: 500 }
    )
  }
}
