export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      issues: {
        Relationships: []
        Row: {
          id: string
          issue_number: number
          slug: string
          published_at: string | null
          editor_note: string | null
          long_read: LongRead | null
          status: 'draft' | 'published' | 'no_signal' | 'pending' | 'failed'
          created_at: string
          pick_reason: string | null
          rejected_alternatives: Array<{ title: string; reason: string }> | null
          teaser: string | null
        }
        Insert: {
          id?: string
          issue_number: number
          slug: string
          published_at?: string | null
          editor_note?: string | null
          long_read?: LongRead | null
          status?: 'draft' | 'published' | 'no_signal' | 'pending' | 'failed'
          created_at?: string
          pick_reason?: string | null
          rejected_alternatives?: Array<{ title: string; reason: string }> | null
          teaser?: string | null
        }
        Update: {
          id?: string
          issue_number?: number
          slug?: string
          published_at?: string | null
          editor_note?: string | null
          long_read?: LongRead | null
          status?: 'draft' | 'published' | 'no_signal' | 'pending' | 'failed'
          created_at?: string
          pick_reason?: string | null
          rejected_alternatives?: Array<{ title: string; reason: string }> | null
          teaser?: string | null
        }
      }
      stories: {
        Relationships: [
          {
            foreignKeyName: 'stories_issue_id_fkey'
            columns: ['issue_id']
            isOneToOne: false
            referencedRelation: 'issues'
            referencedColumns: ['id']
          }
        ]
        Row: {
          id: string
          issue_id: string
          position: number
          category: StoryCategory
          headline: string
          summary: string
          why_it_matters: string
          deeper_read: string | null
          pull_quote: string | null
          editorial_take: string | null
          lens_pm: string | null
          lens_founder: string | null
          lens_builder: string | null
          sources: StorySource[]
          read_minutes: number
          stats: StoryStats[] | null
          action_items: string[] | null
          counter_view: string | null
          counter_view_headline: string | null
          broadcast_phrases: string[] | null
        }
        Insert: {
          id?: string
          issue_id: string
          position: number
          category: StoryCategory
          headline: string
          summary: string
          why_it_matters: string
          deeper_read?: string | null
          pull_quote?: string | null
          editorial_take?: string | null
          lens_pm?: string | null
          lens_founder?: string | null
          lens_builder?: string | null
          sources?: StorySource[]
          read_minutes?: number
          stats?: StoryStats[] | null
          action_items?: string[] | null
          counter_view?: string | null
          counter_view_headline?: string | null
          broadcast_phrases?: string[] | null
        }
        Update: {
          id?: string
          issue_id?: string
          position?: number
          category?: StoryCategory
          headline?: string
          summary?: string
          why_it_matters?: string
          deeper_read?: string | null
          pull_quote?: string | null
          editorial_take?: string | null
          lens_pm?: string | null
          lens_founder?: string | null
          lens_builder?: string | null
          sources?: StorySource[]
          read_minutes?: number
          stats?: StoryStats[] | null
          action_items?: string[] | null
          counter_view?: string | null
          counter_view_headline?: string | null
          broadcast_phrases?: string[] | null
        }
      }
      subscribers: {
        Relationships: []
        Row: {
          id: string
          email: string
          role: SubscriberRole
          status: SubscriberStatus
          subscribed_at: string
          unsubscribe_token: string
        }
        Insert: {
          id?: string
          email: string
          role?: SubscriberRole
          status?: SubscriberStatus
          subscribed_at?: string
          unsubscribe_token?: string
        }
        Update: {
          id?: string
          email?: string
          role?: SubscriberRole
          status?: SubscriberStatus
          subscribed_at?: string
          unsubscribe_token?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Domain types

export type StoryCategory = 'models' | 'tools' | 'business' | 'policy' | 'research'
export type SubscriberRole = 'pm' | 'founder' | 'builder' | 'curious'
export type SubscriberStatus = 'active' | 'unsubscribed'

export interface LongRead {
  title: string
  url: string
  source: string
  why_pick: string
}

export interface StorySource {
  label: string
  url: string
}

export interface StoryStats {
  label: string
  value: string
  delta: string | null  // e.g. "↓ 10×" or "+12%"
  detail: string
}

// Convenience row types

export type Issue = Database['public']['Tables']['issues']['Row']
export type IssueInsert = Database['public']['Tables']['issues']['Insert']
export type IssueUpdate = Database['public']['Tables']['issues']['Update']

export type Story = Database['public']['Tables']['stories']['Row']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
export type StoryUpdate = Database['public']['Tables']['stories']['Update']

export type Subscriber = Database['public']['Tables']['subscribers']['Row']
export type SubscriberInsert = Database['public']['Tables']['subscribers']['Insert']
export type SubscriberUpdate = Database['public']['Tables']['subscribers']['Update']

// Composed types used by the frontend

export type IssueWithStories = Issue & {
  stories: Story[]
}
