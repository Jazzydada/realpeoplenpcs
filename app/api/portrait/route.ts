import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 120

type Quality = 'fast' | 'high'
type ProviderName = 'fal' | 'pollinations'
type GeneratedImage = { buffer: ArrayBuffer; contentType: string; provider: ProviderName }

type PortraitPostBody = {
  prompt?: string
  negativePrompt?: string
  quality?: Quality
  imageStyle?: string
  portraitType?: string
}

function cleanErrorMessage(message: string) {
  if (/queue full|x402version|requests already queued|HTTP 402/i.test(message))
    return 'Billedgenerering er optaget. Vent 20-30 sekunder og prøv igen.'
  if (/fal\.ai|fal\.run/i.test(message))
    return 'fal.ai svarede ikke. Prøv igen om lidt.'
  return message.slice(0, 260)
}

function toDataUrl(image: GeneratedImage) {
  const base64 = Buffer.from(image.buffer).toString('base64')
  return `data:${image.contentType};base64,${base64}`
}

// ─── fal.ai ───────────────────────────────────────────────────────────────────
// fast  → flux/schnell  (~3-5s,  ~$0.003/image)
// high  → flux-pro/v1.1 (~8-12s, ~$0.005/image)
async function generateFalImage(prompt: string, quality: Quality): Promise<GeneratedImage> {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY not configured')

  const model = quality === 'high' ? 'fal-ai/flux-pro/v1.1' : 'fal-ai/flux/schnell'

  const body: Record<string, unknown> = {
    prompt,
    image_size: 'portrait_4_3',   // 768 × 1024
    seed: Math.floor(Math.random() * 2_000_000_000),
    enable_safety_checker: false,
  }
  if (quality === 'fast') body.num_inference_steps = 8

  console.log(`[portrait/fal] Starting ${model}`)
  const startedAt = Date.now()

  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`fal.ai HTTP ${res.status}: ${text.slice(0, 300)}`)
  }

  const data = await res.json() as { images?: Array<{ url: string; content_type?: string }> }
  const imageInfo = data.images?.[0]
  if (!imageInfo?.url) throw new Error('fal.ai returned no image URL')

  console.log(`[portrait/fal] Generated in ${Math.round((Date.now() - startedAt) / 1000)}s — downloading`)

  // Download from fal CDN
  const imgRes = await fetch(imageInfo.url, { signal: AbortSignal.timeout(30_000) })
  if (!imgRes.ok) throw new Error(`fal.ai CDN download failed: HTTP ${imgRes.status}`)
  const buffer = await imgRes.arrayBuffer()
  if (buffer.byteLength < 5000) throw new Error('fal.ai returned an empty image')

  console.log(`[portrait/fal] Done — ${Math.round(buffer.byteLength / 1024)}KB`)
  return { buffer, contentType: imageInfo.content_type ?? 'image/jpeg', provider: 'fal' }
}

// ─── Pollinations fallback ────────────────────────────────────────────────────
async function generatePollinationsImage(prompt: string, quality: Quality): Promise<GeneratedImage> {
  const { w, h } = quality === 'high' ? { w: 768, h: 1024 } : { w: 512, h: 768 }
  const model = quality === 'high' ? 'flux-realism' : 'flux'
  const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${seed}&model=${model}&enhance=false&safe=true&cache=false`

  console.log('[portrait/pollinations] Starting request')
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'image/*' },
        signal: AbortSignal.timeout(60_000),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Pollinations HTTP ${res.status}${text ? ` — ${text.slice(0, 200)}` : ''}`)
      }
      const contentType = res.headers.get('content-type') ?? 'image/jpeg'
      const buffer = await res.arrayBuffer()
      if (buffer.byteLength < 5000) throw new Error('Pollinations returned empty image')
      console.log(`[portrait/pollinations] Done — ${Math.round(buffer.byteLength / 1024)}KB`)
      return { buffer, contentType, provider: 'pollinations' }
    } catch (err) {
      lastError = err
      const msg = err instanceof Error ? err.message : String(err)
      if (!/HTTP 402|queue full|requests already queued/i.test(msg) || attempt === 2) break
      await new Promise(r => setTimeout(r, 7_000))
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Pollinations failed')
}

// ─── POST /api/portrait ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: PortraitPostBody
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const prompt = body.prompt
  if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })

  const quality: Quality = body.quality ?? 'fast'

  try {
    let image: GeneratedImage
    let fallbackReason: string | undefined

    if (process.env.FAL_KEY) {
      // fal.ai is configured — use it as primary
      try {
        image = await generateFalImage(prompt, quality)
      } catch (err) {
        fallbackReason = err instanceof Error ? err.message : 'fal.ai unavailable'
        console.warn('[portrait] fal.ai failed, falling back to Pollinations:', fallbackReason)
        image = await generatePollinationsImage(prompt, quality)
      }
    } else {
      // No API key — use free Pollinations
      console.log('[portrait] FAL_KEY not set, using Pollinations')
      image = await generatePollinationsImage(prompt, quality)
    }

    return NextResponse.json({
      url: toDataUrl(image),
      provider: image.provider,
      fallbackReason: fallbackReason ? cleanErrorMessage(fallbackReason) : undefined,
    })
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Image generation failed'
    console.error('[portrait] Generation failed:', raw)
    return NextResponse.json({ error: cleanErrorMessage(raw) }, { status: 502 })
  }
}
