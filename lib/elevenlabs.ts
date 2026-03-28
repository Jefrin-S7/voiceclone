/**
 * ElevenLabs API Integration
 * Free tier: 10,000 characters/month
 * Sign up: https://elevenlabs.io
 */

const ELEVEN_API = 'https://api.elevenlabs.io/v1'

export interface Voice {
  voice_id: string
  name: string
  preview_url: string
  category: string
  labels?: Record<string, string>
}

export interface CloneVoiceOptions {
  name: string
  description?: string
  audioBlob: Blob
  fileName: string
}

export interface TTSOptions {
  text: string
  voiceId: string
  modelId?: string
  stability?: number
  similarityBoost?: number
  style?: number
  useSpeakerBoost?: boolean
}

/**
 * Clone a voice using audio sample
 */
export async function cloneVoice({
  name,
  description,
  audioBlob,
  fileName,
}: CloneVoiceOptions): Promise<{ voice_id: string; name: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ElevenLabs API key not configured')

  const formData = new FormData()
  formData.append('name', name)
  formData.append('description', description || `Cloned voice: ${name}`)
  formData.append('files', audioBlob, fileName)

  const res = await fetch(`${ELEVEN_API}/voices/add`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail?.message || `Clone failed: ${res.status}`)
  }

  return res.json()
}

/**
 * Generate speech from text using a voice
 */
export async function textToSpeech({
  text,
  voiceId,
  modelId = 'eleven_multilingual_v2',
  stability = 0.5,
  similarityBoost = 0.8,
  style = 0.2,
  useSpeakerBoost = true,
}: TTSOptions): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ElevenLabs API key not configured')

  const res = await fetch(`${ELEVEN_API}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: useSpeakerBoost,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail?.message || `TTS failed: ${res.status}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * List all voices (premade + cloned)
 */
export async function listVoices(): Promise<Voice[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ElevenLabs API key not configured')

  const res = await fetch(`${ELEVEN_API}/voices`, {
    headers: { 'xi-api-key': apiKey },
  })

  if (!res.ok) throw new Error(`Failed to list voices: ${res.status}`)
  const data = await res.json()
  return data.voices || []
}

/**
 * Delete a cloned voice
 */
export async function deleteVoice(voiceId: string): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ElevenLabs API key not configured')

  const res = await fetch(`${ELEVEN_API}/voices/${voiceId}`, {
    method: 'DELETE',
    headers: { 'xi-api-key': apiKey },
  })

  if (!res.ok) throw new Error(`Failed to delete voice: ${res.status}`)
}

/**
 * Get API usage/subscription info
 */
export async function getUsage(): Promise<{
  character_count: number
  character_limit: number
}> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ElevenLabs API key not configured')

  const res = await fetch(`${ELEVEN_API}/user/subscription`, {
    headers: { 'xi-api-key': apiKey },
  })

  if (!res.ok) throw new Error(`Failed to get usage: ${res.status}`)
  return res.json()
}
