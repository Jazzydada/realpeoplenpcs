import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 120

type Provider = 'auto' | 'perchance' | 'pollinations'
type Quality = 'fast' | 'high'
type GeneratedImage = { buffer: ArrayBuffer; contentType: string; provider: 'perchance' | 'pollinations' }

type PortraitPostBody = {
  prompt?: string
  negativePrompt?: string
  provider?: Provider
  quality?: Quality
  name?: string
  imageStyle?: string
  portraitType?: string
}

const USER_AGENT = 'AsaheimRPGFantasyGenerator/10.0 (+https://asaheim.dk)'

function safeFilename(raw: string | null | undefined, fallback = 'portrait.jpg') {
  if (!raw) return fallback
  return raw.replace(/[^a-z0-9._-]+/gi, '-').toLowerCase().slice(0, 80) || fallback
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function sizeForQuality(quality: Quality | undefined) {
  return quality === 'high'
    ? { width: 768, height: 1024, perchanceResolution: '768x1024' }
    : { width: 512, height: 768, perchanceResolution: '512x768' }
}

function randomHex(bytes: number) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes))
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

function cleanErrorMessage(message: string) {
  if (/queue full|x402version|requests already queued|HTTP 402/i.test(message)) {
    return 'Pollinations-køen er fuld lige nu. Vent 20-30 sekunder og prøv igen.'
  }
  if (/perchance/i.test(message)) {
    return 'Perchance svarede ikke korrekt. Prøv igen om lidt, eller brug Pollinations som fallback.'
  }
  return message.slice(0, 260)
}

async function fetchImage(url: string, provider: 'perchance' | 'pollinations', timeoutMs = 120_000): Promise<GeneratedImage> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'image/avif,image/webp,image/png,image/jpeg,*/*',
      'Referer': provider === 'perchance' ? 'https://perchance.org/ai-text-to-image-generator' : 'https://asaheim.dk',
    },
    signal: AbortSignal.timeout(timeoutMs),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const raw = `${provider} image download failed: HTTP ${res.status}${text ? ` — ${text.slice(0, 500)}` : ''}`
    throw new Error(raw)
  }

  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const buffer = await res.arrayBuffer()
  if (buffer.byteLength < 5000) throw new Error(`${provider} returned a too-small image payload`)
  return { buffer, contentType, provider }
}

async function generatePerchanceImage(
  prompt: string,
  negativePrompt: string,
  quality: Quality | undefined,
  imageStyle = 'Cinematic',
  portraitType = 'Three Quarter',
): Promise<GeneratedImage> {
  // START PERCHANCE TIMEOUT FIX
  const startedAt = Date.now()
  console.log('[portrait/perchance] Starting Perchance request')
  const { perchanceResolution } = sizeForQuality(quality)
  const seed = String(Math.floor(Math.random() * 2_000_000_000) - 1_000_000_000)

  // START: v9 Perchance-first call
  // Perchance has no stable commercial API key flow. This mirrors the public
  // image generator endpoint shape and keeps it as the primary free provider.
  const userKey = randomHex(32)
  const params = new URLSearchParams({
    prompt,
    description: prompt,
    artStyle: imageStyle,
    shape: 'portrait',
    portraitType,
    seed,
    resolution: perchanceResolution,
    guidanceScale: '7',
    negativePrompt,
    channel: 'ai-text-to-image-generator',
    subChannel: 'public',
    userKey,
    adAccessCode: '',
    requestId: String(Math.random()),
    __cacheBust: String(Math.random()),
    bdf: String(Math.random()),
  })

  const generateUrl = `https://image-generation.perchance.org/api/generate?${params.toString()}`
  console.log('[portrait/perchance] Request sent', { imageStyle, portraitType, resolution: perchanceResolution })
  const res = await fetch(generateUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json,text/plain,*/*',
      'Referer': 'https://perchance.org/ai-text-to-image-generator',
      'Origin': 'https://perchance.org',
    },
    signal: AbortSignal.timeout(120_000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Perchance generate failed: HTTP ${res.status}${text ? ` — ${text.slice(0, 500)}` : ''}`)
  }

  const text = await res.text()
  console.log('[portrait/perchance] Response received after', Math.round((Date.now() - startedAt) / 1000), 'seconds')
  let imageId: string | undefined
  let directUrl: string | undefined

  try {
    const json = JSON.parse(text) as {
      imageId?: string
      image_id?: string
      id?: string
      output?: string
      url?: string
      imageUrl?: string
      error?: string
    }
    if (json.error) throw new Error(json.error)
    directUrl = json.url ?? json.imageUrl
    imageId = json.imageId ?? json.image_id ?? json.id ?? json.output
  } catch {
    const quotedId = text.match(/"(?:imageId|image_id|id|output)"\s*:\s*"([^"]+)"/i)
    imageId = quotedId?.[1]
    const urlMatch = text.match(/https?:\/\/[^"\s]+/i)
    directUrl = urlMatch?.[0]
  }

  if (directUrl && /^https?:\/\//.test(directUrl)) return fetchImage(directUrl, 'perchance')
  if (!imageId) throw new Error(`Perchance did not return an imageId: ${text.slice(0, 500)}`)

  const downloadUrl = `https://image-generation.perchance.org/api/downloadTemporaryImage?imageId=${encodeURIComponent(imageId)}`
  console.log('[portrait/perchance] Waiting for image result')
  const image = await fetchImage(downloadUrl, 'perchance', 120_000)
  console.log('[portrait/perchance] Image downloaded after', Math.round((Date.now() - startedAt) / 1000), 'seconds')
  // END PERCHANCE TIMEOUT FIX
  return image
  // END: v9 Perchance-first call
}

async function generatePollinationsImage(
  prompt: string,
  quality: Quality | undefined,
): Promise<GeneratedImage> {
  const { width, height } = sizeForQuality(quality)
  const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  const encoded = encodeURIComponent(prompt)
  // flux produces far better fantasy portrait quality than sana.
  // flux-realism adds a realism LoRA on top — ideal for cinematic D&D portraits.
  const model = quality === 'high' ? 'flux-realism' : 'flux'
  // Note: 'fast' uses 'flux' (~6-10s), 'high' uses 'flux-realism' (~15-25s)
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=${model}&enhance=false&safe=true&cache=false`

  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetchImage(url, 'pollinations')
    } catch (err) {
      lastError = err
      const msg = err instanceof Error ? err.message : String(err)
      if (!/HTTP 402|queue full|requests already queued/i.test(msg) || attempt === 2) break
      await sleep(6500)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Pollinations failed')
}

function toDataUrl(image: GeneratedImage) {
  const base64 = Buffer.from(image.buffer).toString('base64')
  return `data:${image.contentType};base64,${base64}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const filename = safeFilename(searchParams.get('filename'), 'portrait.jpg')
  if (!url) return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })

  let parsed: URL
  try { parsed = new URL(url) } catch { return NextResponse.json({ error: 'Invalid url' }, { status: 400 }) }

  const allowedHosts = new Set(['image.pollinations.ai', 'image-generation.perchance.org'])
  if (!allowedHosts.has(parsed.hostname)) {
    return NextResponse.json({ error: 'Only Pollinations and Perchance image hosts are allowed' }, { status: 400 })
  }

  try {
    const image = await fetchImage(url, parsed.hostname.includes('perchance') ? 'perchance' : 'pollinations')
    return new NextResponse(image.buffer, {
      status: 200,
      headers: {
        'Content-Type': image.contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': `inline; filename="${filename}"`,
        'X-Image-Provider': image.provider,
      },
    })
  } catch (err: unknown) {
    console.error('[portrait/proxy] Failed:', err)
    return new NextResponse(null, { status: 502 })
  }
}

export async function POST(req: NextRequest) {
  let body: PortraitPostBody
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const prompt = body.prompt
  if (!prompt || typeof prompt !== 'string') return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })

  const provider = body.provider ?? 'auto'
  const negativePrompt = body.negativePrompt ?? 'text, watermark, logo, modern clothing, sci-fi, blurry, malformed hands, extra fingers, duplicate face, cropped head'
  const quality = body.quality ?? 'fast'
  const imageStyle = body.imageStyle ?? 'Cinematic'
  const portraitType = body.portraitType ?? 'Three Quarter'

  try {
    let image: GeneratedImage
    let fallbackReason: string | undefined

    // Perchance is protected by Cloudflare managed challenge — server-side
    // requests from data-centre IPs (Vercel) always receive an HTML challenge
    // page instead of image data. It cannot be used from a Next.js API route.
    // Pollinations (flux / flux-realism) is used as the sole provider.
    if (provider === 'perchance') {
      // Explicit perchance request: attempt it and fall back gracefully
      try {
        image = await generatePerchanceImage(prompt, negativePrompt, quality, imageStyle, portraitType)
      } catch (err: unknown) {
        fallbackReason = err instanceof Error ? err.message : 'Perchance unavailable'
        console.warn('[portrait] Perchance blocked (Cloudflare), using Pollinations:', fallbackReason)
        image = await generatePollinationsImage(prompt, quality)
      }
    } else {
      // 'auto' or 'pollinations' — go directly to Pollinations
      image = await generatePollinationsImage(prompt, quality)
    }

    return NextResponse.json({ url: toDataUrl(image), provider: image.provider, fallbackReason: fallbackReason ? cleanErrorMessage(fallbackReason) : undefined })
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Image generation failed'
    const message = cleanErrorMessage(raw)
    console.error('[portrait] Generation failed:', raw)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
