'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import VoiceRecorder from '@/components/VoiceRecorder'

type Step = 'record' | 'name' | 'cloning' | 'done'

export default function ClonePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('record')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioFileName, setAudioFileName] = useState('')
  const [voiceName, setVoiceName] = useState('')
  const [voiceDescription, setVoiceDescription] = useState('')
  const [clonedVoiceId, setClonedVoiceId] = useState('')
  const [isCloning, setIsCloning] = useState(false)

  function handleAudioReady(blob: Blob, filename: string) {
    setAudioBlob(blob)
    setAudioFileName(filename)
  }

  function proceedToName() {
    if (!audioBlob) {
      toast.error('Please record or upload a voice sample first')
      return
    }
    setStep('name')
  }

  async function startCloning() {
    if (!voiceName.trim()) {
      toast.error('Please enter a name for your voice clone')
      return
    }
    if (!audioBlob) {
      toast.error('No audio sample found')
      return
    }

    setIsCloning(true)
    setStep('cloning')

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, audioFileName || 'voice.webm')
      formData.append('name', voiceName.trim())
      formData.append('description', voiceDescription.trim() || `Cloned: ${voiceName}`)

      const res = await fetch('/api/clone', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Cloning failed')
      }

      setClonedVoiceId(data.voice_id)
      setStep('done')
      toast.success('Voice clone created!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to clone voice')
      setStep('name')
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-platinum mb-1">Clone a Voice</h1>
        <p className="text-silver text-sm">Upload or record a sample to create your AI voice clone</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {(['record', 'name', 'cloning', 'done'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all
              ${step === s || (s === 'done' && step === 'done') ? 'bg-ember text-white' :
                ['record', 'name', 'cloning', 'done'].indexOf(step) > i ? 'bg-ember/20 text-ember' :
                'bg-surface-2 text-silver/40'}
            `}>
              {['record', 'name', 'cloning', 'done'].indexOf(step) > i ? '✓' : i + 1}
            </div>
            {i < 3 && <div className={`h-px w-8 transition-all ${['record', 'name', 'cloning', 'done'].indexOf(step) > i ? 'bg-ember/40' : 'bg-surface-3'}`} />}
          </div>
        ))}
        <div className="ml-2 text-silver text-sm">
          {step === 'record' && 'Upload Sample'}
          {step === 'name' && 'Name Your Voice'}
          {step === 'cloning' && 'Creating Clone...'}
          {step === 'done' && 'Clone Ready!'}
        </div>
      </div>

      {/* Step: Record */}
      {step === 'record' && (
        <div className="space-y-6">
          <VoiceRecorder onAudioReady={handleAudioReady} />
          {audioBlob && (
            <button
              onClick={proceedToName}
              className="w-full flex items-center justify-center gap-2 bg-ember hover:bg-ember-dark text-white py-3.5 rounded-xl font-medium transition-all ember-glow"
            >
              Continue to Name Your Clone
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Step: Name */}
      {step === 'name' && (
        <div className="space-y-6">
          <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-platinum mb-2">
                Voice Name <span className="text-ember">*</span>
              </label>
              <input
                type="text"
                value={voiceName}
                onChange={e => setVoiceName(e.target.value)}
                placeholder="e.g. My Voice, John's Clone..."
                maxLength={50}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-4 py-3 text-platinum placeholder-silver/40 focus:outline-none focus:border-ember/40 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-platinum mb-2">
                Description <span className="text-silver/40">(optional)</span>
              </label>
              <textarea
                value={voiceDescription}
                onChange={e => setVoiceDescription(e.target.value)}
                placeholder="Describe this voice (e.g. calm, professional, British accent)..."
                rows={3}
                maxLength={200}
                className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-4 py-3 text-platinum placeholder-silver/40 focus:outline-none focus:border-ember/40 transition-colors text-sm resize-none"
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm">
              <p className="text-amber-400 font-medium mb-1">📝 Best Practices</p>
              <ul className="text-silver/70 space-y-1 text-xs">
                <li>• Speak clearly without background noise</li>
                <li>• Use varied sentences (not just one phrase repeated)</li>
                <li>• Avoid heavy compression or effects in source audio</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('record')}
              className="flex-1 py-3.5 bg-surface-1 border border-white/[0.06] hover:bg-surface-2 text-silver rounded-xl font-medium transition-all text-sm"
            >
              ← Back
            </button>
            <button
              onClick={startCloning}
              disabled={!voiceName.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-ember hover:bg-ember-dark disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-medium transition-all text-sm ember-glow"
            >
              <Mic className="w-4 h-4" />
              Clone Voice
            </button>
          </div>
        </div>
      )}

      {/* Step: Cloning */}
      {step === 'cloning' && (
        <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-12 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-ember/20 animate-ping" />
            <div className="w-20 h-20 bg-ember/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-ember animate-spin" />
            </div>
          </div>
          <h3 className="font-display text-xl font-semibold text-platinum mb-2">
            Cloning "{voiceName}"
          </h3>
          <p className="text-silver text-sm">
            AI is analyzing your vocal patterns... This takes 5–15 seconds.
          </p>
          <div className="mt-6 flex gap-1 justify-center">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-ember/60 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div className="bg-surface-1 border border-ember/30 rounded-2xl p-12 text-center ember-glow">
          <div className="w-20 h-20 bg-ember/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-ember" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-platinum mb-2">
            "{voiceName}" is Ready!
          </h3>
          <p className="text-silver text-sm mb-8">
            Your voice clone has been created. Generate speech from any text now.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/tts?voice=${clonedVoiceId}`)}
              className="flex items-center justify-center gap-2 bg-ember hover:bg-ember-dark text-white py-3.5 rounded-xl font-medium transition-all ember-glow"
            >
              Generate Speech Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setStep('record')
                setAudioBlob(null)
                setVoiceName('')
                setVoiceDescription('')
              }}
              className="py-3 text-silver hover:text-platinum text-sm transition-colors"
            >
              + Clone Another Voice
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
