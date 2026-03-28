# 🎙️ VoxClone AI — Voice Cloning Web App

> Clone any voice in seconds. Upload a 10–30 second sample, generate natural human-like speech from any text, and download the audio. Built as a production-ready startup app at $0 cost.

---

## ✨ Live Demo

**[voxclone-ai.vercel.app](https://voxclone-86jk800gi-jefrin-s7s-projects.vercel.app/)**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 App Router                │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  Landing     │    │  App         │                   │
│  │  Page (/)    │    │  Dashboard   │                   │
│  │              │    │  /clone      │                   │
│  │  Marketing   │    │  /tts        │                   │
│  └──────────────┘    └──────┬───────┘                   │
│                             │                           │
│                    ┌────────▼────────┐                  │
│                    │  API Routes     │                  │
│                    │  /api/clone     │                  │
│                    │  /api/tts       │                  │
│                    │  /api/voices    │                  │
│                    │  /api/usage     │                  │
│                    └────────┬────────┘                  │
└─────────────────────────────┼───────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼──────┐ ┌──────▼──────┐ ┌─────▼──────────┐
    │  ElevenLabs    │ │  Firebase   │ │  Firebase      │
    │  Voice API     │ │  Firestore  │ │  Storage       │
    │                │ │  (metadata) │ │  (audio files) │
    │  • Clone Voice │ │             │ │                │
    │  • TTS         │ │  Free Tier  │ │  5GB Free      │
    │  • List Voices │ │             │ │                │
    │  10K chars/mo  │ └─────────────┘ └────────────────┘
    └────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why | Cost |
|---|---|---|---|
| **Frontend** | Next.js 14 (App Router) | SSR, API routes, TypeScript | Free |
| **Styling** | Tailwind CSS | Utility-first, fast | Free |
| **Animations** | CSS + Framer Motion | Smooth UX | Free |
| **Voice AI** | ElevenLabs API | Best quality voice cloning | Free (10K chars/mo) |
| **Database** | Firebase Firestore | Real-time, NoSQL | Free (1GB) |
| **Storage** | Firebase Storage | Audio file storage | Free (5GB) |
| **Deployment** | Vercel | Zero-config Next.js hosting | Free |
| **Total Cost** | — | — | **$0/month** |

---

## 📁 Project Structure

```
voiceclone-ai/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (fonts, toast)
│   ├── globals.css                 # Global styles + animations
│   ├── (app)/
│   │   ├── layout.tsx              # App sidebar navigation
│   │   ├── dashboard/page.tsx      # Voice management dashboard
│   │   ├── clone/page.tsx          # Voice clone wizard (3-step)
│   │   └── tts/page.tsx            # Text-to-speech generator
│   └── api/
│       ├── clone/route.ts          # POST: Clone voice via ElevenLabs
│       ├── tts/route.ts            # POST: Generate speech audio
│       ├── voices/route.ts         # GET: List all voices
│       ├── voices/[voiceId]/route.ts  # DELETE: Remove a voice
│       └── usage/route.ts          # GET: Character usage stats
├── components/
│   └── VoiceRecorder.tsx           # In-browser recorder + file upload
├── lib/
│   ├── firebase.ts                 # Firebase client SDK
│   ├── firebase-admin.ts           # Firebase Admin SDK (server)
│   ├── elevenlabs.ts               # ElevenLabs API wrapper
│   └── utils.ts                    # Shared helpers
├── firestore.rules                 # Security rules
├── storage.rules                   # Storage security rules
├── vercel.json                     # Deployment config
└── .env.local.example              # Environment variable template
```

---

```env
# ElevenLabs
ELEVENLABS_API_KEY=xi_...your_key...

# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

# Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Add environment variables in Vercel Dashboard:**
- Settings → Environment Variables
- Add all variables from `.env.local.example`

> ⚠️ For `FIREBASE_ADMIN_PRIVATE_KEY`, paste the full key including `-----BEGIN/END PRIVATE KEY-----` headers. Vercel handles newlines correctly.

---

## 🔑 Key Technical Decisions

### Why ElevenLabs?
- Industry-leading voice cloning quality with Instant Voice Cloning
- Generous free tier (10K chars/month) — enough for demos and prototypes
- Simple REST API with multipart form upload
- `eleven_multilingual_v2` model supports 29+ languages

### Why Next.js App Router?
- API routes run as Vercel serverless functions — no separate backend needed
- Server Components for fast initial load
- Built-in TypeScript support
- Zero-config Vercel deployment

### Why Firebase?
- Free Spark plan includes 1GB Firestore + 5GB Storage
- Real-time capabilities for future features (shared voices, live generation status)
- Easy security rules with per-user data isolation
- No server management required

### Voice Cloning Flow
```
User uploads audio (browser)
    ↓
Next.js API Route (/api/clone)
    ↓
ElevenLabs /voices/add (multipart upload)
    ↓
Returns voice_id (saved to Firestore)
    ↓
User can now use voice_id in TTS requests
```

### TTS Flow
```
User submits text + voice_id
    ↓
Next.js API Route (/api/tts)
    ↓
ElevenLabs /text-to-speech/{voice_id}
    ↓
Returns audio/mpeg buffer
    ↓
Streamed to browser as Blob URL
    ↓
User can play + download MP3
```

---

## 🎤 Voice Cloning Tips

For the best clone quality:
- **Duration**: 15–30 seconds is optimal; 10 seconds minimum
- **Environment**: Quiet room, minimal reverb
- **Delivery**: Natural speech, varied sentences
- **Format**: WAV or high-bitrate MP3 preferred
- **Content**: Mix of short and long sentences; avoid repetition

## VOICE CLONE IS NOT WORKING ON CURRENTLY. BECAUSE OF FREE CREADITS
## TRY TEXT TO SPEECH WITH ALTERNATE VOICES

---

## 📊 Free Tier Limits

| Service | Free Limit | Resets |
|---|---|---|
| ElevenLabs chars | 10,000/month | Monthly |
| ElevenLabs voices | 3 clones | — |
| Firebase Firestore | 1GB + 50K reads/day | Daily |
| Firebase Storage | 5GB | — |
| Vercel functions | 100GB-hours/month | Monthly |
| Vercel bandwidth | 100GB/month | Monthly |

---

## 🔒 Security

- API keys are server-side only (`ELEVENLABS_API_KEY` never exposed to client)
- Firebase Security Rules enforce per-user data isolation
- No audio data stored permanently without user intent
- All API routes validate input before calling external services

---

## 🗺️ Roadmap

- [ ] Google/GitHub OAuth authentication
- [ ] Voice generation history with audio storage in Firebase
- [ ] Batch TTS (upload a document, get full audiobook)
- [ ] Voice mixing and style controls
- [ ] Shareable voice cards
- [ ] Usage dashboard with monthly tracking
- [ ] Webhook for async generation status

---

## 📄 License

MIT — free to use, modify, and deploy.

---

## 🙏 Credits

- [ElevenLabs](https://elevenlabs.io) — Voice AI API
- [Firebase](https://firebase.google.com) — Database & Storage
- [Vercel](https://vercel.com) — Hosting
- [Next.js](https://nextjs.org) — React Framework
