'use client'

import { useState } from 'react'

const DEFAULT_PROMPT =
  'cinematic fantasy RPG portrait, wood elf ranger, three-quarter body, forest background, dramatic lighting'
const DEFAULT_NEGATIVE =
  'text, watermark, logo, blurry, bad anatomy, cropped, face only, close-up'

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

interface TestResult {
  logs: StepLog[]
  imageUrl: string | null
  imageSize: number
  seed: string
  userKey: string
}

export default function PerchanceTestPage() {
  const [prompt, setPrompt]               = useState(DEFAULT_PROMPT)
  const [negative, setNegative]           = useState(DEFAULT_NEGATIVE)
  const [resolution, setResolution]       = useState('768x1024')
  const [artStyle, setArtStyle]           = useState('Cinematic')
  const [portraitType, setPortraitType]   = useState('Three Quarter')
  const [loading, setLoading]             = useState(false)
  const [result, setResult]               = useState<TestResult | null>(null)
  const [elapsed, setElapsed]             = useState<number | null>(null)
  const [fetchError, setFetchError]       = useState<string | null>(null)
  const [expandedStep, setExpandedStep]   = useState<string | null>(null)

  async function run() {
    setLoading(true)
    setResult(null)
    setElapsed(null)
    setFetchError(null)
    const t0 = Date.now()
    try {
      const res = await fetch('/api/perchance-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, negativePrompt: negative, resolution, artStyle, portraitType }),
      })
      const data = await res.json() as TestResult
      setResult(data)
      // Auto-expand first failed step
      const firstFailed = data.logs.find(l => l.responseStatus !== 200 || l.error)
      if (firstFailed) setExpandedStep(firstFailed.step)
      else setExpandedStep(data.logs[data.logs.length - 1]?.step ?? null)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err))
    } finally {
      setElapsed(Date.now() - t0)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0b07', color: '#d4af37', fontFamily: 'monospace', padding: '2rem', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '1rem', letterSpacing: '0.18em', marginBottom: '1.5rem', color: '#c9a84c' }}>
        ⚗ PERCHANCE API DEBUG
      </h1>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 720, marginBottom: '1.5rem' }}>
        <Label text="Prompt">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={2} style={inputStyle} />
        </Label>
        <Label text="Negative">
          <textarea value={negative} onChange={e => setNegative(e.target.value)} rows={1} style={inputStyle} />
        </Label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Label text="Resolution">
            <select value={resolution} onChange={e => setResolution(e.target.value)} style={selectStyle}>
              <option>512x768</option><option>768x1024</option>
            </select>
          </Label>
          <Label text="Art style">
            <select value={artStyle} onChange={e => setArtStyle(e.target.value)} style={selectStyle}>
              <option>Cinematic</option><option>painterly</option><option>dark</option>
            </select>
          </Label>
          <Label text="Portrait type">
            <select value={portraitType} onChange={e => setPortraitType(e.target.value)} style={selectStyle}>
              <option>Three Quarter</option><option>Full Body</option><option>Bust</option>
            </select>
          </Label>
        </div>
        <button onClick={run} disabled={loading} style={btnStyle(loading)}>
          {loading ? '⏳ Running…' : '▶ Run'}
        </button>
      </div>

      {fetchError && <div style={errorBox}>{fetchError}</div>}

      {result && (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Image */}
          <div style={{ flexShrink: 0, width: 260 }}>
            <Dim>IMAGE {elapsed != null ? `— ${(elapsed/1000).toFixed(1)}s` : ''}</Dim>
            <Dim>seed: {result.seed}</Dim>
            <div style={{ marginTop: 8, border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.03)', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {result.imageUrl
                ? <img src={result.imageUrl} alt="result" style={{ width: '100%', display: 'block' }} />
                : <span style={{ color: 'rgba(201,168,76,0.25)', fontSize: '0.65rem' }}>no image</span>
              }
            </div>
            {result.imageSize > 0 && <Dim>{(result.imageSize/1024).toFixed(0)} KB</Dim>}
          </div>

          {/* Steps */}
          <div style={{ flex: 1, minWidth: 340 }}>
            <Dim>STEPS ({result.logs.length})</Dim>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.logs.map(log => {
                const ok = log.responseStatus === 200 && !log.error
                const isOpen = expandedStep === log.step
                return (
                  <div key={log.step} style={{ border: `1px solid ${ok ? 'rgba(80,200,120,0.3)' : 'rgba(200,80,80,0.3)'}`, background: 'rgba(0,0,0,0.35)' }}>
                    {/* Header row */}
                    <button
                      onClick={() => setExpandedStep(isOpen ? null : log.step)}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      <span style={{ fontSize: '0.6rem', color: ok ? '#50c878' : '#c05050', minWidth: 14 }}>{ok ? '✓' : '✗'}</span>
                      <span style={{ fontSize: '0.65rem', color: '#c9a84c', letterSpacing: '0.08em' }}>{log.step.toUpperCase()}</span>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(201,168,76,0.45)', marginLeft: 'auto' }}>HTTP {log.responseStatus}</span>
                      <span style={{ fontSize: '0.55rem', color: 'rgba(201,168,76,0.3)' }}>{log.method}</span>
                      <span style={{ fontSize: '0.55rem', color: 'rgba(201,168,76,0.25)' }}>{isOpen ? '▲' : '▼'}</span>
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Endpoint */}
                        <Section label="ENDPOINT">
                          <Code>{log.endpoint}</Code>
                        </Section>

                        {/* Headers sent */}
                        <Section label="REQUEST HEADERS">
                          <Code>{JSON.stringify(log.headers, null, 2)}</Code>
                        </Section>

                        {/* Body if POST */}
                        {log.body && (
                          <Section label="REQUEST BODY">
                            <Code>{log.body}</Code>
                          </Section>
                        )}

                        {/* Response headers */}
                        <Section label="RESPONSE HEADERS">
                          <Code>{JSON.stringify(log.responseHeaders, null, 2)}</Code>
                        </Section>

                        {/* Raw response */}
                        <Section label={`RAW RESPONSE (HTTP ${log.responseStatus})`}>
                          <Code highlight={log.rawResponse}>{log.rawResponse || '(empty)'}</Code>
                        </Section>

                        {log.error && (
                          <Section label="ERROR">
                            <Code>{log.error}</Code>
                          </Section>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: '0.6rem', color: 'rgba(201,168,76,0.5)', letterSpacing: '0.1em' }}>
      {text}
      {children}
    </label>
  )
}

function Dim({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '0.58rem', color: 'rgba(201,168,76,0.35)', letterSpacing: '0.08em', marginBottom: 2 }}>{children}</div>
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '0.55rem', color: 'rgba(201,168,76,0.4)', letterSpacing: '0.12em', marginBottom: 3 }}>{label}</div>
      {children}
    </div>
  )
}

function Code({ children, highlight }: { children: React.ReactNode; highlight?: string }) {
  const isError = highlight && (highlight.includes('invalid') || highlight.includes('error') || highlight.includes('cloudflare') || highlight.includes('challenge'))
  return (
    <pre style={{
      background: 'rgba(0,0,0,0.5)', border: `1px solid ${isError ? 'rgba(200,80,80,0.3)' : 'rgba(201,168,76,0.12)'}`,
      padding: '6px 8px', fontSize: '0.6rem', color: isError ? '#e09090' : '#a89060',
      whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 300, overflowY: 'auto', margin: 0,
    }}>
      {children}
    </pre>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(201,168,76,0.2)',
  color: '#d4af37', padding: '4px 6px', fontSize: '0.7rem',
  fontFamily: 'monospace', resize: 'vertical', width: '100%', boxSizing: 'border-box',
}
const selectStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(201,168,76,0.2)',
  color: '#d4af37', padding: '3px 6px', fontSize: '0.7rem', fontFamily: 'monospace',
}
function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    alignSelf: 'flex-start', padding: '5px 20px',
    background: disabled ? 'rgba(201,168,76,0.05)' : 'rgba(201,168,76,0.12)',
    border: '1px solid rgba(201,168,76,0.4)',
    color: disabled ? 'rgba(201,168,76,0.3)' : '#d4af37',
    cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: '0.1em', fontSize: '0.7rem',
  }
}
const errorBox: React.CSSProperties = {
  background: 'rgba(180,40,40,0.12)', border: '1px solid rgba(180,40,40,0.4)',
  padding: '8px 12px', fontSize: '0.7rem', color: '#e08080', marginBottom: 16,
}
