import { NextRequest, NextResponse } from 'next/server'
import { cloneVoice } from '@/lib/elevenlabs'

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData()
    const audio = formData.get('audio') as File | null
    const name = formData.get('name') as string | null
    const description = formData.get('description') as string | null

    // Validate inputs
    if (!audio || audio.size === 0) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Voice name is required' },
        { status: 400 }
      )
    }

    // Validate file size (50MB max)
    if (audio.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Convert File to Blob for the API
    const audioBlob = new Blob([await audio.arrayBuffer()], { type: audio.type })

    // Call ElevenLabs voice cloning API
    const result = await cloneVoice({
      name: name.trim(),
      description: description?.trim() || `Cloned voice: ${name}`,
      audioBlob,
      fileName: audio.name || 'voice.webm',
    })

    return NextResponse.json({
      voice_id: result.voice_id,
      name: result.name,
      message: 'Voice cloned successfully',
    })
  } catch (error: any) {
    console.error('[API /clone] Error:', error)

    // Handle ElevenLabs-specific errors
    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Monthly voice clone limit reached. Upgrade your ElevenLabs plan.' },
        { status: 429 }
      )
    }

    if (error.message?.includes('422')) {
      return NextResponse.json(
        { error: 'Audio quality too low. Please use a clearer recording.' },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to clone voice. Please try again.' },
      { status: 500 }
    )
  }
}
