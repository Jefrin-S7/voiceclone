'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, Upload, Play, Pause, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn, formatDuration, isValidAudioFile, formatBytes } from '@/lib/utils'

interface VoiceRecorderProps {
  onAudioReady: (blob: Blob, filename: string) => void
  maxDuration?: number // seconds
  minDuration?: number // seconds
}

type RecordState = 'idle' | 'recording' | 'recorded' | 'uploaded'

export default function VoiceRecorder({
  onAudioReady,
  maxDuration = 30,
  minDuration = 5,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordState>('idle')
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [fileName, setFileName] = useState('recorded_voice.webm')
  const [error, setError] = useState<string | null>(null)
  const [analyserBars, setAnalyserBars] = useState<number[]>(Array(20).fill(4))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const durationRef = useRef(0)

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current)
      animFrameRef.current && cancelAnimationFrame(animFrameRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      audioUrl && URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  function visualize(stream: MediaStream) {
    const audioCtx = new AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 64
    const src = audioCtx.createMediaStreamSource(stream)
    src.connect(analyser)
    analyserRef.current = analyser

    const data = new Uint8Array(analyser.frequencyBinCount)
    function draw() {
      analyser.getByteFrequencyData(data)
      const bars = Array.from({ length: 20 }, (_, i) => {
        const val = data[Math.floor(i * data.length / 20)] || 0
        return Math.max(4, (val / 255) * 60)
      })
      setAnalyserBars(bars)
      animFrameRef.current = requestAnimationFrame(draw)
    }
    draw()
  }

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      visualize(stream)

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      
      const mr = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setFileName('recorded_voice.webm')
        setState('recorded')
        onAudioReady(blob, 'recorded_voice.webm')
        stream.getTracks().forEach(t => t.stop())
        animFrameRef.current && cancelAnimationFrame(animFrameRef.current)
        setAnalyserBars(Array(20).fill(4))
      }

      mr.start(100)
      setState('recording')
      durationRef.current = 0
      setDuration(0)

      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setDuration(durationRef.current)
        if (durationRef.current >= maxDuration) {
          stopRecording()
        }
      }, 1000)
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.')
    }
  }

  function stopRecording() {
    timerRef.current && clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  function togglePlayback() {
    if (!audioUrl) return
    if (!audioRef.current) {
      const a = new Audio(audioUrl)
      a.onended = () => { setIsPlaying(false); audioRef.current = null }
      audioRef.current = a
    }
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  function reset() {
    audioRef.current?.pause()
    audioRef.current = null
    audioUrl && URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
    setDuration(0)
    setFileName('recorded_voice.webm')
    setState('idle')
    setError(null)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!isValidAudioFile(file)) {
      setError('Unsupported format. Please use MP3, WAV, OGG, or WebM.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.')
      return
    }

    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.onloadedmetadata = () => {
      const dur = Math.round(audio.duration)
      setDuration(dur)
      if (dur < minDuration) {
        setError(`Audio too short. Minimum ${minDuration} seconds required.`)
        URL.revokeObjectURL(url)
        return
      }
      setAudioBlob(file)
      setAudioUrl(url)
      setFileName(file.name)
      setState('uploaded')
      onAudioReady(file, file.name)
    }
    audio.onerror = () => setError('Failed to read audio file.')
    e.target.value = ''
  }

  const isReady = state === 'recorded' || state === 'uploaded'
  const isRecording = state === 'recording'

  return (
    <div className="space-y-4">
      {/* Main recorder area */}
      <div className={cn(
        'relative bg-surface-1 border rounded-2xl overflow-hidden transition-all',
        isRecording ? 'border-red-500/40' : isReady ? 'border-ember/30' : 'border-white/[0.06]'
      )}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            {isRecording && <div className="w-2 h-2 rounded-full bg-red-500 record-pulse" />}
            {isReady && <CheckCircle className="w-4 h-4 text-ember" />}
            {state === 'idle' && <div className="w-2 h-2 rounded-full bg-surface-3" />}
            <span className="text-xs font-mono text-silver">
              {isRecording ? 'Recording...' : isReady ? fileName : 'Ready to record'}
            </span>
          </div>
          <span className="text-xs font-mono text-silver">
            {formatDuration(duration)} / {formatDuration(maxDuration)}
          </span>
        </div>

        {/* Waveform / Visualizer */}
        <div className="flex items-center justify-center h-28 gap-1 px-6">
          {isRecording ? (
            analyserBars.map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-ember rounded-full transition-all duration-75"
                style={{ height: `${h}px` }}
              />
            ))
          ) : isReady ? (
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayback}
                className="w-10 h-10 bg-ember/10 hover:bg-ember/20 border border-ember/20 rounded-xl flex items-center justify-center transition-all"
              >
                {isPlaying
                  ? <Pause className="w-4 h-4 text-ember" fill="currentColor" />
                  : <Play className="w-4 h-4 text-ember" fill="currentColor" />
                }
              </button>
              <div className="flex gap-1 items-center">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-ember/40 rounded-full"
                    style={{ height: `${Math.sin(i * 0.5 + 1) * 16 + 8}px` }}
                  />
                ))}
              </div>
              <div className="text-right">
                <div className="text-xs text-silver font-mono">{formatDuration(duration)}</div>
                {audioBlob && <div className="text-xs text-silver/40">{formatBytes(audioBlob.size)}</div>}
              </div>
            </div>
          ) : (
            <div className="flex gap-1 items-center opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-silver rounded-full"
                  style={{ height: `${Math.random() * 24 + 8}px` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
          {!isReady ? (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isRecording
                    ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400'
                    : 'bg-ember hover:bg-ember-dark text-white ember-glow'
                )}
              >
                {isRecording ? (
                  <><Square className="w-4 h-4" fill="currentColor" /> Stop Recording</>
                ) : (
                  <><Mic className="w-4 h-4" /> Start Recording</>
                )}
              </button>

              <label className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 hover:bg-surface-3 border border-white/[0.06] rounded-xl text-sm text-silver cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                Upload File
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="sr-only" />
              </label>
            </>
          ) : (
            <>
              <div className="text-sm text-silver">
                {state === 'recorded' ? '✓ Recorded' : '✓ Uploaded'} · Ready to clone
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-sm text-silver hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      {/* Duration guide */}
      {!isReady && (
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          {[
            { range: '5–15s', label: 'Minimum', color: 'text-yellow-400' },
            { range: '15–25s', label: 'Good', color: 'text-ember' },
            { range: '25–30s', label: 'Optimal', color: 'text-green-400' },
          ].map(({ range, label, color }) => (
            <div key={label} className="bg-surface-1 border border-white/[0.06] rounded-xl p-2">
              <div className={cn('font-mono font-medium', color)}>{range}</div>
              <div className="text-silver/50 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-silver/40 space-y-1 px-1">
        <p>💡 <strong className="text-silver/60">Tips for best quality:</strong></p>
        <p>• Use a quiet environment with minimal background noise</p>
        <p>• Speak naturally at normal pace — avoid whispering or shouting</p>
        <p>• MP3, WAV, OGG, WebM supported · Max 50MB</p>
      </div>
    </div>
  )
}
