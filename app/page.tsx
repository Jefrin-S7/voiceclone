'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Mic, Wand2, Download, Play, Pause, Github, Zap, Shield, Globe, ChevronDown } from 'lucide-react'

const DEMO_SENTENCES = [
  "Hello, this is my cloned voice speaking to you right now.",
  "The future of communication is here — your voice, everywhere.",
  "Imagine your voice reading audiobooks, narrating videos, or calling loved ones.",
]

export default function LandingPage() {
  const [currentDemo, setCurrentDemo] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % DEMO_SENTENCES.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-void overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ember flex items-center justify-center ember-glow">
            <Mic className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-semibold text-platinum">VoxClone</span>
          <span className="text-ember text-xs font-mono ml-1 mt-1">AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-silver text-sm">
          <a href="#features" className="hover:text-platinum transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-platinum transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-platinum transition-colors">Pricing</a>
          <a href="https://github.com/Jefrin-S7/voiceclone" target="_blank" className="hover:text-platinum transition-colors flex items-center gap-1.5">
            <Github className="w-4 h-4" /> GitHub
          </a>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 bg-ember hover:bg-ember-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all ember-glow hover:ember-glow-strong"
        >
          Try Free <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center grain pt-24"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,77,28,0.08) 0%, transparent 60%)' }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(232,232,240,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,232,240,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full opacity-[0.06] blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, #ff4d1c, transparent)', animationDelay: '0s' }} />
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 rounded-full opacity-[0.04] blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, #ff7a4d, transparent)', animationDelay: '3s' }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-surface-1 border border-white/10 rounded-full px-4 py-2 mb-8 text-sm">
            <Zap className="w-3.5 h-3.5 text-ember" />
            <span className="text-silver">Powered by ElevenLabs · 100% Free to Start</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-platinum leading-[0.95] mb-6">
            Clone Any
            <br />
            <span className="text-ember">Voice</span> in
            <br />
            Seconds.
          </h1>

          <p className="text-silver text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Upload a 10–30 second voice sample. Our AI learns your unique vocal signature
            and generates natural, expressive speech from any text — indistinguishable from the real thing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2 bg-ember hover:bg-ember-dark text-white px-8 py-4 rounded-xl text-base font-medium transition-all ember-glow hover:ember-glow-strong"
            >
              Clone Your Voice Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#demo"
              className="flex items-center justify-center gap-2 bg-surface-1 hover:bg-surface-2 text-platinum border border-white/10 px-8 py-4 rounded-xl text-base font-medium transition-all"
            >
              <Play className="w-4 h-4 text-ember" fill="currentColor" />
              Hear Demo
            </a>
          </div>

          {/* Animated Demo Text */}
          <div id="demo" className="relative bg-surface-1 border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember to-transparent opacity-60" />
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-silver text-xs font-mono">voice_output.mp3</span>
            </div>

            {/* Waveform */}
            <div className="flex items-center justify-center gap-1.5 h-14 mb-4">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    animationDelay: `${(i * 0.05) % 1.2}s`,
                    height: `${Math.sin(i * 0.8) * 16 + 20}px`,
                    opacity: isPlaying ? 1 : 0.4,
                  }}
                />
              ))}
            </div>

            {/* Demo text carousel */}
            <div className="text-center">
              <p className="text-silver text-sm font-mono mb-1">Generating:</p>
              <p
                key={currentDemo}
                className="text-platinum text-sm italic"
                style={{ animation: 'fadeInUp 0.5s ease-out' }}
              >
                "{DEMO_SENTENCES[currentDemo]}"
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-silver/40">
            <span className="text-xs tracking-widest uppercase">Explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-surface-1 border-y border-white/5 py-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6 text-center">
          {[
            { value: '10s', label: 'Min. Sample' },
            { value: '99%', label: 'Accuracy' },
            { value: '29+', label: 'Languages' },
            { value: '0$', label: 'To Start' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="font-display text-3xl font-bold text-ember">{value}</div>
              <div className="text-silver text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-ember text-sm font-mono tracking-widest uppercase mb-3">What You Get</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-platinum">
              Everything You Need
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: 'Voice Recording & Upload',
                desc: 'Record directly in-browser or upload MP3/WAV files. As little as 10 seconds is enough to create a stunning clone.',
                tag: 'Real-time',
              },
              {
                icon: Wand2,
                title: 'AI Voice Cloning',
                desc: 'ElevenLabs\' state-of-the-art model analyzes your vocal patterns, cadence, and timbre to create an exact digital twin.',
                tag: 'Powered by ElevenLabs',
              },
              {
                icon: Download,
                title: 'Generate & Download',
                desc: 'Type any text and hear it spoken in your cloned voice. Download MP3 files instantly, no watermarks.',
                tag: 'MP3 Export',
              },
              {
                icon: Globe,
                title: 'Multilingual',
                desc: '29+ languages supported. Clone in English, speak in Spanish. Your voice, any language.',
                tag: '29+ Languages',
              },
              {
                icon: Shield,
                title: 'Privacy First',
                desc: 'Your voice data is stored securely in Firebase. You own your clones — delete anytime.',
                tag: 'Secure',
              },
              {
                icon: Zap,
                title: 'Instant Generation',
                desc: 'Text-to-speech generation in under 3 seconds. Real-time audio playback with waveform visualization.',
                tag: '< 3 sec',
              },
            ].map(({ icon: Icon, title, desc, tag }) => (
              <div
                key={title}
                className="group bg-surface-1 border border-white/[0.06] hover:border-ember/30 rounded-2xl p-6 transition-all hover:-translate-y-1"
              >
                <div className="w-10 h-10 bg-ember/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-ember/20 transition-colors">
                  <Icon className="w-5 h-5 text-ember" />
                </div>
                <div className="inline-block bg-ember/10 text-ember text-xs font-mono px-2 py-0.5 rounded mb-3">{tag}</div>
                <h3 className="font-semibold text-platinum mb-2">{title}</h3>
                <p className="text-silver text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-surface-1/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-ember text-sm font-mono tracking-widest uppercase mb-3">Simple Process</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-platinum">
              Three Steps to Your Clone
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Upload or Record',
                desc: 'Provide a 10–30 second audio sample. Speak clearly, avoid background noise. The cleaner the sample, the better the clone.',
                detail: 'Accepts MP3, WAV, OGG, WebM • Up to 50MB',
              },
              {
                step: '02',
                title: 'AI Clones Your Voice',
                desc: 'Our system sends your sample to ElevenLabs Instant Voice Cloning API. In seconds, a digital twin of your voice is ready.',
                detail: 'Takes 5–15 seconds • Saved to your dashboard',
              },
              {
                step: '03',
                title: 'Generate & Download',
                desc: 'Type any text — a book chapter, script, message — and hear it spoken in your exact voice. Download the audio file.',
                detail: 'MP3 download • No watermarks • Unlimited generations',
              },
            ].map(({ step, title, desc, detail }, i) => (
              <div key={step} className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-16 h-16 bg-ember/10 border border-ember/20 rounded-2xl flex items-center justify-center group-hover:bg-ember/20 transition-colors">
                  <span className="font-mono text-ember font-bold">{step}</span>
                </div>
                <div className="flex-1 bg-surface-1 border border-white/[0.06] rounded-2xl p-5">
                  <h3 className="font-semibold text-platinum text-lg mb-1">{title}</h3>
                  <p className="text-silver text-sm leading-relaxed mb-2">{desc}</p>
                  <p className="text-silver/50 text-xs font-mono">{detail}</p>
                </div>
                {i < 2 && (
                  <div className="absolute left-8 mt-16 w-px h-6 bg-ember/20" style={{ position: 'relative', marginLeft: -56, marginTop: 64 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-ember text-sm font-mono tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-platinum mb-4">
            Completely Free to Start
          </h2>
          <p className="text-silver mb-12 max-w-xl mx-auto">
            VoxClone is built on ElevenLabs' free tier — 10,000 characters per month, no credit card required.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-surface-1 border border-white/10 rounded-2xl p-8 text-left">
              <div className="text-2xl font-bold text-platinum mb-1">Free</div>
              <div className="text-silver text-sm mb-6">Forever</div>
              <ul className="space-y-3 text-sm">
                {['10,000 chars/month', '3 voice clones', 'MP3 downloads', '29+ languages', 'Basic voices'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-silver">
                    <div className="w-1.5 h-1.5 rounded-full bg-ember" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-1 border border-ember/40 rounded-2xl p-8 text-left relative overflow-hidden ember-glow">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember to-transparent" />
              <div className="text-2xl font-bold text-platinum mb-1">Scale</div>
              <div className="text-silver text-sm mb-6">With your ElevenLabs plan</div>
              <ul className="space-y-3 text-sm">
                {['Up to 500K chars/month', 'Unlimited voice clones', 'Priority generation', 'Commercial use', 'API access'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-silver">
                    <div className="w-1.5 h-1.5 rounded-full bg-ember" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-surface-1 border border-white/10 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5"
              style={{ background: 'radial-gradient(circle at 50% 50%, #ff4d1c, transparent 70%)' }} />
            <h2 className="font-display text-4xl font-bold text-platinum mb-4 relative z-10">
              Your Voice.<br />Anywhere.
            </h2>
            <p className="text-silver mb-8 relative z-10">
              Join thousands of creators, developers, and businesses using VoxClone to bring their voice to the world.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-ember hover:bg-ember-dark text-white px-10 py-4 rounded-xl text-base font-medium transition-all ember-glow hover:ember-glow-strong relative z-10"
            >
              Start Cloning Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-silver text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-ember/80 flex items-center justify-center">
              <Mic className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-semibold text-platinum">VoxClone AI</span>
          </div>
          <div className="text-silver/50 text-xs">
            Built with Next.js · Firebase · ElevenLabs · Deployed on Vercel
          </div>
          <a
            href="https://github.com/Jefrin-S7/voiceclone"
            target="_blank"
            className="flex items-center gap-1.5 hover:text-platinum transition-colors"
          >
            <Github className="w-4 h-4" /> Open Source
          </a>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
