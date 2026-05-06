#!/usr/bin/env node
// Test trigger for generate-signal pipeline.
// Usage: node scripts/trigger-test.mjs
//
// Prereqs: npm run dev (port 3001) + npx inngest-cli@latest dev (port 8288) both running.

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Parse .env.local ──────────────────────────────────────────────────────────
const envPath = new URL('../.env.local', import.meta.url).pathname
const envLines = readFileSync(envPath, 'utf8').split('\n')
const env = {}
for (const line of envLines) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
  env[key] = val
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SUPABASE_SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
const INNGEST_PORT = 8288

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// ── Create admin Supabase client ──────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── Create a test issue ───────────────────────────────────────────────────────
console.log('Creating test issue in Supabase...')
const { data: maxRow } = await supabase
  .from('issues')
  .select('issue_number')
  .order('issue_number', { ascending: false })
  .limit(1)
  .single()

const nextNumber = (maxRow?.issue_number ?? 0) + 1
const slug = `test-${Date.now()}`

const { data: issue, error: issueErr } = await supabase
  .from('issues')
  .insert({ issue_number: nextNumber, slug, status: 'pending' })
  .select('id, issue_number')
  .single()

if (issueErr || !issue) {
  console.error('Failed to create issue:', issueErr)
  process.exit(1)
}

console.log(`Issue created: id=${issue.id} issue_number=${issue.issue_number}`)

// ── Send signal/daily.trigger event to Inngest dev server ────────────────────
const payload = {
  name: 'signal/daily.trigger',
  data: { issueId: issue.id, issueNumber: issue.issue_number },
}

console.log(`Sending event to Inngest dev server (localhost:${INNGEST_PORT})...`)
console.log('Payload:', JSON.stringify(payload, null, 2))

const res = await fetch(`http://localhost:${INNGEST_PORT}/e/dev`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
}).catch(e => { console.error(`Cannot reach Inngest dev server on port ${INNGEST_PORT}.`, e.message); process.exit(1) })

if (!res.ok) {
  const body = await res.text()
  console.error(`Inngest returned ${res.status}: ${body}`)
  process.exit(1)
}

console.log(`\nEvent sent. Inngest status: ${res.status}`)
console.log(`\nWatch the Inngest dashboard: http://localhost:${INNGEST_PORT}`)
console.log(`\nOnce the pipeline completes, run this query in Supabase SQL editor to inspect results:`)
console.log(`
SELECT
  s.id,
  s.headline,
  s.extended_data
FROM stories s
JOIN issues i ON i.id = s.issue_id
WHERE i.id = '${issue.id}'
LIMIT 1;
`)
console.log(`Issue ID for reference: ${issue.id}`)
