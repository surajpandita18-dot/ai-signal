-- Migration 002: add email_html column to briefs table
-- Run via: supabase db push  OR  paste into Supabase SQL editor
-- Added for Sprint 3 — Formatter stores rendered email HTML here.

ALTER TABLE briefs ADD COLUMN IF NOT EXISTS email_html text;
