/**
 * AI, Basically. — Supabase Database typings.
 *
 * Hand-written to match supabase/migrations/20260612000000_initial_aibasically.sql.
 * JSONB columns import their shapes from the shared content model so the web
 * page, the email twin, and the pipeline all speak the same language.
 *
 * Path note: this file lives at /db/types/, OUTSIDE /src, so it cannot use
 * the "@/*" tsconfig alias — use the relative import below.
 */

import type {
  IssueContent,
  TldrRow,
  OneThing,
  SoWhat,
  BuildNotes,
  JobSignal,
  UnderTheHood,
  TheRep,
  Toolbox,
  RealityCheck,
  IndiaSignal,
  Sponsor,
  Decoder,
  Closer,
  Poll,
  Foot,
  IssueStatus,
  Lens,
} from '../../src/lib/content-model'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── issues ────────────────────────────────────────────────────────────────
type IssueRow = {
  id: string
  issue_number: number
  slug: string
  published_at: string | null
  status: IssueStatus
  hero_eyebrow: string
  hero_headline_html: string
  hero_sub_html: string
  date_display: string
  read_time_min: number
  streak_caption: string
  tldr: TldrRow[]
  one_thing: OneThing
  so_what: SoWhat
  build_notes: BuildNotes
  job_signal: JobSignal
  under_the_hood: UnderTheHood
  the_rep: TheRep
  toolbox: Toolbox
  reality_check: RealityCheck
  india_signal: IndiaSignal
  sponsor: Sponsor
  decoder: Decoder
  closer: Closer
  poll: Poll
  foot: Foot
  created_at: string
  updated_at: string
}

type IssueInsert = {
  id?: string
  issue_number: number
  slug: string
  published_at?: string | null
  status?: IssueStatus
  hero_eyebrow: string
  hero_headline_html: string
  hero_sub_html: string
  date_display: string
  read_time_min: number
  streak_caption: string
  tldr?: TldrRow[]
  one_thing: OneThing
  so_what: SoWhat
  build_notes: BuildNotes
  job_signal: JobSignal
  under_the_hood: UnderTheHood
  the_rep: TheRep
  toolbox?: Toolbox
  reality_check: RealityCheck
  india_signal: IndiaSignal
  sponsor?: Sponsor
  decoder?: Decoder
  closer: Closer
  poll: Poll
  foot: Foot
  created_at?: string
  updated_at?: string
}

type IssueUpdate = Partial<IssueInsert>

// ── subscribers ───────────────────────────────────────────────────────────
export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced'

type SubscriberRow = {
  id: string
  email: string
  role: Lens | null
  status: SubscriberStatus
  referral_code: string
  unsubscribe_token: string
  source: string | null
  subscribed_at: string
}

type SubscriberInsert = {
  id?: string
  email: string
  role?: Lens | null
  status?: SubscriberStatus
  referral_code?: string
  unsubscribe_token?: string
  source?: string | null
  subscribed_at?: string
}

type SubscriberUpdate = Partial<SubscriberInsert>

// ── referrals ─────────────────────────────────────────────────────────────
type ReferralRow = {
  id: string
  referrer_id: string
  referred_id: string
  created_at: string
}

type ReferralInsert = {
  id?: string
  referrer_id: string
  referred_id: string
  created_at?: string
}

type ReferralUpdate = Partial<ReferralInsert>

// ── lens_prefs ────────────────────────────────────────────────────────────
type LensPrefRow = {
  subscriber_id: string
  primary_track: Lens
  updated_at: string
}

type LensPrefInsert = {
  subscriber_id: string
  primary_track: Lens
  updated_at?: string
}

type LensPrefUpdate = Partial<LensPrefInsert>

// ── poll_responses ────────────────────────────────────────────────────────
type PollResponseRow = {
  id: string
  issue_id: string
  subscriber_id: string | null
  choice: string
  ip_hash: string | null
  created_at: string
}

type PollResponseInsert = {
  id?: string
  issue_id: string
  subscriber_id?: string | null
  choice: string
  ip_hash?: string | null
  created_at?: string
}

type PollResponseUpdate = Partial<PollResponseInsert>

// ── Database ──────────────────────────────────────────────────────────────
// Note: supabase-js v2 expects each table to carry a `Relationships` array
// even if empty, and the top-level Schema to expose Tables / Views /
// Functions. We have no foreign-key-driven joins in the API surface yet, so
// every Relationships array is empty for now.
export interface Database {
  public: {
    Tables: {
      issues: {
        Row: IssueRow
        Insert: IssueInsert
        Update: IssueUpdate
        Relationships: []
      }
      subscribers: {
        Row: SubscriberRow
        Insert: SubscriberInsert
        Update: SubscriberUpdate
        Relationships: []
      }
      referrals: {
        Row: ReferralRow
        Insert: ReferralInsert
        Update: ReferralUpdate
        Relationships: [
          {
            foreignKeyName: 'referrals_referrer_id_fkey'
            columns: ['referrer_id']
            isOneToOne: false
            referencedRelation: 'subscribers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'referrals_referred_id_fkey'
            columns: ['referred_id']
            isOneToOne: false
            referencedRelation: 'subscribers'
            referencedColumns: ['id']
          },
        ]
      }
      lens_prefs: {
        Row: LensPrefRow
        Insert: LensPrefInsert
        Update: LensPrefUpdate
        Relationships: [
          {
            foreignKeyName: 'lens_prefs_subscriber_id_fkey'
            columns: ['subscriber_id']
            isOneToOne: true
            referencedRelation: 'subscribers'
            referencedColumns: ['id']
          },
        ]
      }
      poll_responses: {
        Row: PollResponseRow
        Insert: PollResponseInsert
        Update: PollResponseUpdate
        Relationships: [
          {
            foreignKeyName: 'poll_responses_issue_id_fkey'
            columns: ['issue_id']
            isOneToOne: false
            referencedRelation: 'issues'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'poll_responses_subscriber_id_fkey'
            columns: ['subscriber_id']
            isOneToOne: false
            referencedRelation: 'subscribers'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Re-export for convenience (so callers can do `import type { IssueContent } from '@/types'`).
export type { IssueContent }
