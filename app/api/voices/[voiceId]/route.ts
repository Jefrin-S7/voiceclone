import { NextRequest, NextResponse } from 'next/server'
import { deleteVoice } from '@/lib/elevenlabs'

// DELETE /api/voices/[voiceId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { voiceId: string } }
) {
  try {
    const { voiceId } = params

    if (!voiceId) {
      return NextResponse.json(
        { error: 'Voice ID is required' },
        { status: 400 }
      )
    }

    await deleteVoice(voiceId)

    return NextResponse.json({
      success: true,
      message: `Voice ${voiceId} deleted`,
    })
  } catch (error: any) {
    console.error('[API /voices/[voiceId]] DELETE Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete voice' },
      { status: 500 }
    )
  }
}
