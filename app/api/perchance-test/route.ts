import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 120

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const REFERER   = 'https://perchance.org/ai-text-to-image-generator'
const ORIGIN    = 'https://perchance.org'

function randomHex(bytes: number) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes))
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface StepLog {
  step: string
  endpoint: string
  method: string
  headers: Record<string, string>
  body?: string | null
  responseStatus: number
  responseHeaders: Record<string, string>
  rawResponse: string
  error?: string
}

async function fetchWithLog(
  step: string,
  url: string,
  options: RequestInit,
): Promise<StepLog & { ok: boolean }> {
  const headers = options.headers as Record<string, string>
  const body = options.body as string | null | undefined

  console.log(`\n[perchance-test] === ${step} ===`)
  console.log('Endpoint:', url)
  console.log('Method:', options.method ?? 'GET')
  console.log('Headers:', JSON.stringify(headers, null, 2))
  if (body) console.log('Body:', body.slice(0, 500))

  const log: StepLog = {
    step,
    endpoint: url,
    method: options.method as string ?? 'GET',
    headers,
    body: body ?? null,
    responseStatus: 0,
    responseHeaders: {},
    rawResponse: '',
  }

  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(30_000) })
    log.responseStatus = res.status
    res.headers.forEach((v, k) => { log.responseHeaders[k] = v })
    log.rawResponse = await res.text()
    console.log('Response status:', res.status)
    console.log('Response:', log.rawResponse.slice(0, 1000))
    return { ...log, ok: res.ok }
  } catch (err) {
    log.error = err instanceof Error ? err.message : String(err)
    log.rawResponse = log.error
    console.log('Error:', log.error)
    return { ...log, ok: false }
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>
  const prompt         = String(body.prompt         ?? 'fantasy character portrait')
  const negativePrompt = String(body.negativePrompt ?? 'text, watermark, logo, blurry')
  const resolution     = String(body.resolution     ?? '768x1024')
  const artStyle       = String(body.artStyle       ?? 'Cinematic')
  const portraitType   = String(body.portraitType   ?? 'Three Quarter')

  const logs: StepLog[] = []
  const seed    = String(Math.floor(Math.random() * 2_000_000_000) - 1_000_000_000)
  const userKey = randomHex(32)

  // ── STEP 1: Try to get a verification token ────────────────────────────────
  // Perchance may require fetching a token/key from a verification endpoint
  // before the generate call. Try a few known patterns.
  const verifyEndpoints = [
    `https://image-generation.perchance.org/api/verifyUser?userKey=${userKey}&adAccessCode=`,
    `https://perchance.org/api/getUserKey`,
    `https://image-generation.perchance.org/api/getVerificationCode?userKey=${userKey}`,
  ]

  for (const endpoint of verifyEndpoints) {
    const log = await fetchWithLog('verify', endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json,text/plain,*/*',
        'Referer': REFERER,
        'Origin': ORIGIN,
      },
    })
    logs.push(log)
    if (log.ok && !log.rawResponse.includes('invalid') && !log.rawResponse.includes('cloudflare')) break
  }

  // ── STEP 2: Generate endpoint ──────────────────────────────────────────────
  const params = new URLSearchParams({
    prompt,
    description: prompt,
    artStyle,
    shape: 'portrait',
    portraitType,
    seed,
    resolution,
    guidanceScale: '7',
    negativePrompt,
    channel: 'ai-text-to-image-generator',
    subChannel: 'public',
    userKey,
    adAccessCode: '',            // empty — this is likely the problem
    requestId: String(Math.random()),
    __cacheBust: String(Math.random()),
    bdf: String(Math.random()),
  })

  const generateUrl = `https://image-generation.perchance.org/api/generate`
  const generateHeaders: Record<string, string> = {
    'User-Agent': USER_AGENT,
    'Accept': 'application/json,text/plain,*/*',
    'Referer': REFERER,
    'Origin': ORIGIN,
  }

  const generateLog = await fetchWithLog('generate', `${generateUrl}?${params.toString()}`, {
    method: 'GET',
    headers: generateHeaders,
  })
  logs.push(generateLog)

  // ── STEP 3: Also try POST variant ─────────────────────────────────────────
  const postBody = JSON.stringify({
    prompt, negativePrompt, artStyle, portraitType, resolution,
    seed, userKey, adAccessCode: '', channel: 'ai-text-to-image-generator',
  })
  const postLog = await fetchWithLog('generate-POST', generateUrl, {
    method: 'POST',
    headers: {
      ...generateHeaders,
      'Content-Type': 'application/json',
    },
    body: postBody,
  })
  logs.push(postLog)

  // ── STEP 4: Try image download if we got an imageId ───────────────────────
  let imageUrl: string | null = null
  let imageSize = 0
  const generateResponse = generateLog.rawResponse
  let imageId: string | undefined

  try {
    const json = JSON.parse(generateResponse) as Record<string, unknown>
    imageId = String(json.imageId ?? json.image_id ?? json.id ?? json.output ?? '')
    if (!imageId) imageId = undefined
  } catch {
    const m = generateResponse.match(/"(?:imageId|image_id|id|output)"\s*:\s*"([^"]+)"/i)
    imageId = m?.[1]
  }

  if (imageId) {
    const downloadUrl = `https://image-generation.perchance.org/api/downloadTemporaryImage?imageId=${encodeURIComponent(imageId)}`
    const dlLog = await fetchWithLog('download', downloadUrl, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'image/*,*/*',
        'Referer': REFERER,
      },
    })
    logs.push(dlLog)

    if (dlLog.responseStatus === 200 && dlLog.rawResponse.length > 5000) {
      // rawResponse is binary text — re-fetch as ArrayBuffer
      try {
        const imgRes = await fetch(downloadUrl, {
          headers: { 'User-Agent': USER_AGENT, 'Referer': REFERER },
          signal: AbortSignal.timeout(30_000),
        })
        const buf = await imgRes.arrayBuffer()
        imageSize = buf.byteLength
        const ct = imgRes.headers.get('content-type') ?? 'image/jpeg'
        imageUrl = `data:${ct};base64,${Buffer.from(buf).toString('base64')}`
      } catch { /* ignore */ }
    }
  }

  return NextResponse.json({ logs, imageUrl, imageSize, seed, userKey })
}
