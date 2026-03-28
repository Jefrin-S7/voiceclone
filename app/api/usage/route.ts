import { NextRequest, NextResponse } from 'next/server'
import { getUsage } from '@/lib/elevenlabs'

// GET /api/usage — get character usage stats
export async function GET(req: NextRequest) {
  try {
    const usage = await getUsage()
    return NextResponse.json(usage)
  } catch (error: any) {
    console.error('[API /usage] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch usage' },
      { status: 500 }
    )
  }
}
