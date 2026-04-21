#!/bin/bash
# scripts/setup-env.sh
# Creates .env.local with placeholder values if it doesn't exist.
# Run: bash scripts/setup-env.sh
#
# If you see "Operation not permitted", macOS TCC is blocking the write.
# In that case, create .env.local manually — instructions are printed below.

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"
EXAMPLE="$ROOT/scripts/env.example"

# ── Required content ─────────────────────────────────────────────

ENV_CONTENT='# AI Signal — local environment variables
# Never commit this file — it is in .gitignore.

# PostHog — https://app.posthog.com → Project Settings → Project API Key
NEXT_PUBLIC_POSTHOG_KEY=phc_REPLACE_WITH_YOUR_KEY
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Anthropic — https://console.anthropic.com → API Keys
# Also add as GitHub Actions secret named ANTHROPIC_API_KEY
ANTHROPIC_API_KEY=sk-ant-REPLACE_WITH_YOUR_KEY

# NextAuth — https://next-auth.js.org
# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth App — https://github.com/settings/applications/new
# Authorization callback URL: http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID=YOUR_GITHUB_OAUTH_APP_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_OAUTH_APP_CLIENT_SECRET
'

# ── Already exists ───────────────────────────────────────────────

if [ -f "$ENV_FILE" ]; then
  echo "✓ .env.local already exists at $ENV_FILE"
  echo "  Edit it to fill in real keys. To reset: delete the file and re-run."
  exit 0
fi

# ── Try to write ─────────────────────────────────────────────────

if printf '%s' "$ENV_CONTENT" > "$ENV_FILE" 2>/dev/null; then
  echo "✓ Created $ENV_FILE"
  echo ""
  echo "Next steps:"
  echo "  1. Open .env.local"
  echo "  2. Replace NEXT_PUBLIC_POSTHOG_KEY  → PostHog project API key"
  echo "     https://app.posthog.com → Project Settings → Project API Key"
  echo "  3. Replace ANTHROPIC_API_KEY        → Anthropic API key"
  echo "     https://console.anthropic.com → API Keys"
  echo "  4. npm run dev"
  exit 0
fi

# ── TCC blocked — manual instructions ───────────────────────────

echo "⚠️  macOS TCC blocked automatic file creation for .env.local"
echo "   (This is a known macOS security restriction on .env* filenames.)"
echo ""
echo "Fix: Create the file manually in one step:"
echo ""
echo "─────────────────────────────────────────────────────────────"
echo "Run this in your terminal (paste as one block):"
echo ""
cat << 'MANUAL'
cat > /Users/surajpandita/Documents/projects/ai_signal/.env.local << 'EOF'
# AI Signal — local environment variables
# Never commit this file — it is in .gitignore.

# PostHog — https://app.posthog.com → Project Settings → Project API Key
NEXT_PUBLIC_POSTHOG_KEY=phc_REPLACE_WITH_YOUR_KEY
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Anthropic — https://console.anthropic.com → API Keys
ANTHROPIC_API_KEY=sk-ant-REPLACE_WITH_YOUR_KEY

# NextAuth — generate secret: openssl rand -base64 32
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth App — https://github.com/settings/applications/new
# Authorization callback URL: http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID=YOUR_GITHUB_OAUTH_APP_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_GITHUB_OAUTH_APP_CLIENT_SECRET
EOF
MANUAL
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "Then open .env.local and replace both placeholder values."
echo ""
echo "Alternatively: open Finder → project root → Cmd+Shift+. to show"
echo "hidden files → create .env.local with any text editor."
exit 1
