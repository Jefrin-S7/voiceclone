'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Wand2, Play, Pause, Download, Loader2, Volume2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { downloadBlob, formatDuration } from '@/lib/utils'

interface Voice {
  voice_id: string
  name: string
  category: string
  preview_url?: string
}

const CHAR_LIMIT = 2500

function TTSContent() {
  const searchParams = useSearchParams()
  const preselectedVoice = searchParams.get('voice')

  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState(preselectedVoice || '')
  const [text, setText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loadingVoices, setLoadingVoices] = useState(true)
  const [stability, setStability] = useState(0.5)
  const [similarity, setSimilarity] = useState(0.8)
  const [showSettings, setShowSettings] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchVoices()
  }, [])

  useEffect(() => {
    return () => {
      audioUrl && URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  async function fetchVoices() {
    try {
      const res = await fetch('/api/voices')
      const data = await res.json()
      if (data.voices) {
        setVoices(data.voices)
        if (!preselectedVoice && data.voices.length > 0) {
          const cloned = data.voices.find((v: Voice) => v.category === 'cloned')
          setSelectedVoiceId(cloned?.voice_id || data.voices[0].voice_id)
        }
      }
    } catch (e) {
      toast.error('Failed to load voices')
    } finally {
      setLoadingVoices(false)
    }
  }

  async function generateSpeech() {
    if (!text.trim()) { toast.error('Please enter some text'); return }
    if (!selectedVoiceId) { toast.error('Please select a voice'); return }
    if (text.length > CHAR_LIMIT) { toast.error(`Text exceeds ${CHAR_LIMIT} character limit`); return }

    setIsGenerating(true)
    stopAudio()
    audioUrl && URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setAudioBlob(null)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: selectedVoiceId,
          stability,
          similarityBoost: similarity,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Generation failed')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioBlob(blob)
      setAudioUrl(url)
      toast.success('Speech generated!')

      // Auto-play
      setTimeout(() => playAudio(url, blob), 100)
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate speech')
    } finally {
      setIsGenerating(false)
    }
  }

  function playAudio(url?: string, blob?: Blob) {
    const src = url || audioUrl
    if (!src) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(src)
    audioRef.current = audio

    audio.onloadedmetadata = () => setAudioDuration(audio.duration)
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime)
    audio.onended = () => { setIsPlaying(false); setCurrentTime(0) }
    audio.onerror = () => { setIsPlaying(false); toast.error('Playback error') }

    audio.play()
    setIsPlaying(true)
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentTime(0)
  }

  function togglePlayback() {
    if (!audioUrl) return
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      if (audioRef.current) {
        audioRef.current.play()
        setIsPlaying(true)
      } else {
        playAudio()
      }
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * audioDuration
  }

  function handleDownload() {
    if (!audioBlob) return
    const voiceName = voices.find(v => v.voice_id === selectedVoiceId)?.name || 'voice'
    const filename = `voxclone_${voiceName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.mp3`
    downloadBlob(audioBlob, filename)
    toast.success('Downloaded!')
  }

  const charCount = text.length
  const charPercent = Math.min((charCount / CHAR_LIMIT) * 100, 100)
  const selectedVoice = voices.find(v => v.voice_id === selectedVoiceId)
  const clonedVoices = voices.filter(v => v.category === 'cloned')
  const premadeVoices = voices.filter(v => v.category !== 'cloned')

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-platinum mb-1">Text to Speech</h1>
        <p className="text-silver text-sm">Generate natural speech using your cloned voices</p>
      </div>

      <div className="space-y-5">
        {/* Voice Selector */}
        <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-5">
          <label className="block text-sm font-medium text-platinum mb-3">Select Voice</label>

          {loadingVoices ? (
            <div className="flex items-center gap-2 text-silver text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading voices...
            </div>
          ) : voices.length === 0 ? (
            <div className="text-silver text-sm py-2">
              No voices found.{' '}
              <a href="/clone" className="text-ember hover:underline">Clone a voice first →</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Cloned voices first */}
              {clonedVoices.length > 0 && (
                <>
                  <div className="col-span-full text-xs text-silver/50 font-mono uppercase tracking-wider mb-1">
                    Your Clones
                  </div>
                  {clonedVoices.map(v => (
                    <button
                      key={v.voice_id}
                      onClick={() => setSelectedVoiceId(v.voice_id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                        selectedVoiceId === v.voice_id
                          ? 'border-ember/40 bg-ember/10 text-platinum'
                          : 'border-white/[0.06] hover:border-white/10 text-silver hover:text-platinum'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedVoiceId === v.voice_id ? 'bg-ember' : 'bg-surface-3'}`} />
                      <span className="truncate">{v.name}</span>
                      <span className="ml-auto text-xs text-ember/60">Clone</span>
                    </button>
                  ))}
                </>
              )}

              {/* Premade voices */}
              {premadeVoices.length > 0 && (
                <>
                  <div className="col-span-full text-xs text-silver/50 font-mono uppercase tracking-wider mt-2 mb-1">
                    Premade Voices
                  </div>
                  {premadeVoices.slice(0, 6).map(v => (
                    <button
                      key={v.voice_id}
                      onClick={() => setSelectedVoiceId(v.voice_id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                        selectedVoiceId === v.voice_id
                          ? 'border-ember/40 bg-ember/10 text-platinum'
                          : 'border-white/[0.06] hover:border-white/10 text-silver hover:text-platinum'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedVoiceId === v.voice_id ? 'bg-ember' : 'bg-surface-3'}`} />
                      <span className="truncate">{v.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Text Input */}
        <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-platinum">Your Text</label>
            <span className={`text-xs font-mono ${charCount > CHAR_LIMIT * 0.9 ? 'text-red-400' : 'text-silver/50'}`}>
              {charCount}/{CHAR_LIMIT}
            </span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste the text you want to convert to speech..."
            rows={6}
            maxLength={CHAR_LIMIT}
            className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-4 py-3 text-platinum placeholder-silver/30 focus:outline-none focus:border-ember/40 transition-colors text-sm resize-none leading-relaxed"
          />

          {/* Char progress bar */}
          <div className="mt-2 bg-surface-3 rounded-full h-0.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${charPercent > 90 ? 'bg-red-400' : 'bg-ember/60'}`}
              style={{ width: `${charPercent}%` }}
            />
          </div>

          {/* Quick fill buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "Hello, this is my cloned voice speaking to you.",
              "Welcome to VoxClone AI, where your voice becomes digital.",
              "The quick brown fox jumps over the lazy dog.",
            ].map(sample => (
              <button
                key={sample.slice(0, 20)}
                onClick={() => setText(sample)}
                className="text-xs text-silver/40 hover:text-silver px-2 py-1 rounded-lg hover:bg-surface-2 transition-all truncate max-w-[200px]"
              >
                "{sample.slice(0, 30)}…"
              </button>
            ))}
          </div>
        </div>

        {/* Voice Settings */}
        <div className="bg-surface-1 border border-white/[0.06] rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2 transition-colors"
          >
            <span className="text-sm font-medium text-silver">Voice Settings</span>
            <ChevronDown className={`w-4 h-4 text-silver/50 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
          </button>

          {showSettings && (
            <div className="px-5 pb-5 border-t border-white/[0.06] space-y-5 pt-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-silver">Stability</label>
                  <span className="text-xs font-mono text-ember">{stability.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={stability}
                  onChange={e => setStability(Number(e.target.value))}
                  className="w-full accent-ember"
                />
                <div className="flex justify-between text-xs text-silver/30 mt-1">
                  <span>More Variable</span><span>More Stable</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-silver">Similarity Boost</label>
                  <span className="text-xs font-mono text-ember">{similarity.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={similarity}
                  onChange={e => setSimilarity(Number(e.target.value))}
                  className="w-full accent-ember"
                />
                <div className="flex justify-between text-xs text-silver/30 mt-1">
                  <span>Low</span><span>High</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={generateSpeech}
          disabled={isGenerating || !text.trim() || !selectedVoiceId}
          className="w-full flex items-center justify-center gap-2 bg-ember hover:bg-ember-dark disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium transition-all ember-glow text-sm"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating Speech...</>
          ) : (
            <><Wand2 className="w-4 h-4" /> Generate Speech</>
          )}
        </button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="bg-surface-1 border border-ember/20 rounded-2xl overflow-hidden ember-glow">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-ember" />
                <span className="text-sm font-medium text-platinum">Generated Audio</span>
              </div>
              {selectedVoice && (
                <span className="text-xs text-silver/50 font-mono">{selectedVoice.name}</span>
              )}
            </div>

            <div className="p-5">
              {/* Waveform visual */}
              <div className="flex items-center gap-1 justify-center h-16 mb-4">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      audioDuration && (i / 40) < (currentTime / audioDuration)
                        ? 'bg-ember'
                        : 'bg-surface-3'
                    }`}
                    style={{ height: `${Math.abs(Math.sin(i * 0.5 + 0.8)) * 32 + 8}px` }}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div
                ref={progressRef}
                onClick={handleProgressClick}
                className="bg-surface-3 rounded-full h-1 mb-3 cursor-pointer overflow-hidden"
              >
                <div
                  className="h-full bg-ember rounded-full transition-all"
                  style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%' }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-silver/50 font-mono mb-4">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(audioDuration)}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayback}
                  className="w-12 h-12 bg-ember hover:bg-ember-dark rounded-xl flex items-center justify-center transition-all ember-glow flex-shrink-0"
                >
                  {isPlaying
                    ? <Pause className="w-5 h-5 text-white" fill="currentColor" />
                    : <Play className="w-5 h-5 text-white" fill="currentColor" />
                  }
                </button>

                <div className="flex-1 text-sm text-silver truncate">
                  {text.slice(0, 60)}{text.length > 60 ? '…' : ''}
                </div>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-white/[0.06] rounded-xl text-sm text-silver hover:text-platinum transition-all"
                >
                  <Download className="w-4 h-4" />
                  MP3
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TTSPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center gap-2 text-silver">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    }>
      <TTSContent />
    </Suspense>
  )
}
