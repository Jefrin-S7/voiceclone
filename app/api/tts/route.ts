import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/elevenlabs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      text,
      voiceId,
      modelId = 'eleven_multilingual_v2',
      stability = 0.5,
      similarityBoost = 0.8,
      style = 0.2,
      useSpeakerBoost = true,
    } = body

    // Validate inputs
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!voiceId || typeof voiceId !== 'string') {
      return NextResponse.json(
        { error: 'Voice ID is required' },
        { status: 400 }
      )
    }

    // Enforce character limits (free tier: 2500/request)
    const MAX_CHARS = 2500
    if (text.length > MAX_CHARS) {
      return NextResponse.json(
        { error: `Text exceeds ${MAX_CHARS} character limit. Please shorten your text.` },
        { status: 400 }
      )
    }

    // Generate speech audio
    const audioBuffer = await textToSpeech({
      text: text.trim(),
      voiceId,
      modelId,
      stability: Number(stability),
      similarityBoost: Number(similarityBoost),
      style: Number(style),
      useSpeakerBoost: Boolean(useSpeakerBoost),
    })

    // Return audio as MP3 stream
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Content-Disposition': 'inline; filename="speech.mp3"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('[API /tts] Error:', error)

    if (error.message?.includes('quota') || error.message?.includes('character')) {
      return NextResponse.json(
        { error: 'Monthly character limit reached. Upgrade your ElevenLabs plan.' },
        { status: 429 }
      )
    }

    if (error.message?.includes('voice_not_found') || error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'Voice not found. It may have been deleted.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Speech generation failed. Please try again.' },
      { status: 500 }
    )
  }
}
