'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mic, Wand2, Plus, Play, Trash2, Download, Clock, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface Voice {
  voice_id: string
  name: string
  preview_url: string
  category: string
}

export default function DashboardPage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null)
  const [usage, setUsage] = useState({ used: 0, limit: 10000 })

  useEffect(() => {
    fetchVoices()
    fetchUsage()
  }, [])

  async function fetchVoices() {
    try {
      const res = await fetch('/api/voices')
      const data = await res.json()
      if (data.voices) setVoices(data.voices.filter((v: Voice) => v.category === 'cloned'))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsage() {
    try {
      const res = await fetch('/api/usage')
      const data = await res.json()
      if (data.character_count !== undefined) {
        setUsage({ used: data.character_count, limit: data.character_limit || 10000 })
      }
    } catch (e) {
      console.error(e)
    }
  }

  function togglePlay(voice: Voice) {
    if (playingId === voice.voice_id) {
      audioEl?.pause()
      setPlayingId(null)
      setAudioEl(null)
    } else {
      audioEl?.pause()
      const a = new Audio(voice.preview_url)
      a.onended = () => { setPlayingId(null); setAudioEl(null) }
      a.play()
      setPlayingId(voice.voice_id)
      setAudioEl(a)
    }
  }

  async function deleteVoice(voiceId: string) {
    if (!confirm('Delete this voice clone? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/voices/${voiceId}`, { method: 'DELETE' })
      if (res.ok) {
        setVoices(prev => prev.filter(v => v.voice_id !== voiceId))
        toast.success('Voice deleted')
      } else {
        toast.error('Failed to delete voice')
      }
    } catch (e) {
      toast.error('Error deleting voice')
    }
  }

  const usagePercent = Math.min((usage.used / usage.limit) * 100, 100)

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-platinum mb-1">Dashboard</h1>
        <p className="text-silver text-sm">Manage your voice clones and generate audio</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-silver text-sm">Voice Clones</span>
            <Mic className="w-4 h-4 text-ember" />
          </div>
          <div className="font-display text-4xl font-bold text-platinum">{voices.length}</div>
          <div className="text-silver/50 text-xs mt-1">of 3 on free tier</div>
        </div>

        <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-silver text-sm">Characters Used</span>
            <Zap className="w-4 h-4 text-ember" />
          </div>
          <div className="font-display text-4xl font-bold text-platinum">{usage.used.toLocaleString()}</div>
          <div className="mt-2">
            <div className="bg-surface-3 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-ember rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="text-silver/50 text-xs mt-1">{usage.limit.toLocaleString()} limit</div>
          </div>
        </div>

        <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-silver text-sm">Plan</span>
            <Clock className="w-4 h-4 text-ember" />
          </div>
          <div className="font-display text-2xl font-bold text-platinum">Free</div>
          <div className="text-silver/50 text-xs mt-1">Resets monthly</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/clone"
          className="group flex items-center gap-4 bg-ember/10 hover:bg-ember/20 border border-ember/20 hover:border-ember/40 rounded-2xl p-5 transition-all"
        >
          <div className="w-12 h-12 bg-ember/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mic className="w-6 h-6 text-ember" />
          </div>
          <div>
            <div className="font-semibold text-platinum">Clone a Voice</div>
            <div className="text-silver text-sm">Upload or record a 10–30s sample</div>
          </div>
        </Link>

        <Link
          href="/tts"
          className="group flex items-center gap-4 bg-surface-1 hover:bg-surface-2 border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 transition-all"
        >
          <div className="w-12 h-12 bg-surface-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wand2 className="w-6 h-6 text-silver" />
          </div>
          <div>
            <div className="font-semibold text-platinum">Text to Speech</div>
            <div className="text-silver text-sm">Generate audio from your clones</div>
          </div>
        </Link>
      </div>

      {/* My Voices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-platinum">My Voice Clones</h2>
          <Link
            href="/clone"
            className="flex items-center gap-1.5 text-sm text-ember hover:text-ember-glow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Voice
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-surface-1 border border-white/[0.06] rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-surface-3 rounded w-1/3 mb-3" />
                <div className="h-3 bg-surface-3 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : voices.length === 0 ? (
          <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-silver/40" />
            </div>
            <p className="text-silver mb-1">No voice clones yet</p>
            <p className="text-silver/50 text-sm mb-4">Upload a voice sample to get started</p>
            <Link
              href="/clone"
              className="inline-flex items-center gap-2 bg-ember text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-ember-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Clone Your First Voice
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voices.map(voice => (
              <div
                key={voice.voice_id}
                className="group bg-surface-1 border border-white/[0.06] hover:border-ember/20 rounded-2xl p-5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ember/10 rounded-xl flex items-center justify-center">
                      <Mic className="w-5 h-5 text-ember" />
                    </div>
                    <div>
                      <div className="font-medium text-platinum">{voice.name}</div>
                      <div className="text-silver/50 text-xs font-mono mt-0.5">{voice.voice_id.slice(0, 12)}…</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {voice.preview_url && (
                      <button
                        onClick={() => togglePlay(voice)}
                        className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
                        title="Preview voice"
                      >
                        <Play
                          className="w-4 h-4 text-silver"
                          fill={playingId === voice.voice_id ? 'currentColor' : 'none'}
                        />
                      </button>
                    )}
                    <Link
                      href={`/tts?voice=${voice.voice_id}`}
                      className="p-2 hover:bg-surface-3 rounded-lg transition-colors"
                      title="Use in TTS"
                    >
                      <Wand2 className="w-4 h-4 text-silver" />
                    </Link>
                    <button
                      onClick={() => deleteVoice(voice.voice_id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-silver hover:text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <Link
                    href={`/tts?voice=${voice.voice_id}`}
                    className="text-xs text-ember hover:text-ember-glow transition-colors font-medium"
                  >
                    Generate speech with this voice →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
