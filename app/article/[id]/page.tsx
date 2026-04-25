import Link from "next/link";
import { existsSync, readFileSync } from "fs";
import path from "path";
import realNewsRaw from "@/lib/realNews.json";
import type { Signal } from "@/lib/types";

type RealArticle = {
  id: string;
  source: string;
  title: string;
  link: string;
  date: string;
  summary: string;
  category?: string;
  tags?: string[];
};

const CATEGORY_EMOJI: Record<string, string> = {
  llm: "🧠", models: "🧠", research: "🔬", infra: "⚡",
  infrastructure: "⚡", funding: "💰", product: "🚀",
  agents: "🤖", "open source": "📦", policy: "🛡️",
};

function getEmoji(tags: string[]): string {
  return tags.map((t) => CATEGORY_EMOJI[t.toLowerCase()]).find(Boolean) ?? "📡";
}

function cleanSummary(summary: string): string {
  return summary
    .replace(/arXiv:\S+\s+Announce Type:\s+\w+\s+Abstract:\s*/i, "")
    .replace(/^Abstract:\s*/i, "")
    .trim();
}

function normalizeId(value: string) {
  return decodeURIComponent(value).trim().toLowerCase();
}

function loadProcessedSignals(): Signal[] {
  try {
    const filePath = path.join(process.cwd(), "lib", "processedSignals.json");
    if (!existsSync(filePath)) return [];
    return JSON.parse(readFileSync(filePath, "utf-8")) as Signal[];
  } catch {
    return [];
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const normalizedRouteId = normalizeId(id);

  const realNews = realNewsRaw as RealArticle[];
  const processedSignals = loadProcessedSignals();

  const article = realNews.find((item) => normalizeId(item.id) === normalizedRouteId);
  const processed = processedSignals.find((s) => normalizeId(s.id) === normalizedRouteId);

  const what = processed?.what ?? null;
  const why = processed?.why ?? null;
  const takeaway = processed?.takeaway ?? null;
  const hasLLM = !!(processed?.processed && (what || why || takeaway));
  const articleTags: string[] = article?.tags ?? processed?.tags ?? [];
  const emoji = getEmoji(articleTags);

  if (!article) {
    return (
      <main style={{ minHeight: "100vh", background: "#0a0a0a" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px" }}>
          <Link href="/app" style={{ fontSize: "13px", color: "#52525b", textDecoration: "none" }}>← Back</Link>
          <p style={{ color: "#52525b", marginTop: "48px" }}>Signal not found.</p>
        </div>
      </main>
    );
  }

  // Related signals
  const relatedArticles: RealArticle[] = [];
  if (articleTags.length > 0) {
    const candidates = processedSignals.length > 0
      ? processedSignals.filter((s) => normalizeId(s.id) !== normalizedRouteId && s.tags?.some((t) => articleTags.includes(t)))
      : [];
    for (const c of candidates.slice(0, 3)) {
      const raw = realNews.find((r) => normalizeId(r.id) === normalizeId(c.id));
      if (raw) relatedArticles.push(raw);
    }
    if (relatedArticles.length === 0) {
      for (const r of realNews) {
        if (relatedArticles.length >= 3) break;
        if (normalizeId(r.id) === normalizedRouteId) continue;
        if ((r.tags ?? []).some((t) => articleTags.includes(t))) relatedArticles.push(r);
      }
    }
  }

  const cleanedSummary = cleanSummary(article.summary);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a" }}>

      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#0a0a0a",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: "52px", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/app" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />
          <span style={{ fontWeight: 800, fontSize: "13px", letterSpacing: "0.1em", color: "#ffffff", textTransform: "uppercase" }}>
            AI Signal
          </span>
        </Link>
        <Link href="/app" style={{ fontSize: "12px", color: "#52525b", textDecoration: "none", fontWeight: 500 }}>
          ← Back to feed
        </Link>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 96px" }}>

        {/* Source + date — Rundown category header style */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {article.source}
          </span>
          <span style={{ color: "#27272a" }}>·</span>
          <span style={{ fontSize: "11px", color: "#3f3f46" }}>
            {new Date(article.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {articleTags[0] && (
            <>
              <span style={{ color: "#27272a" }}>·</span>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {articleTags[0]}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(22px, 4vw, 30px)",
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.2,
          letterSpacing: "-0.025em",
          marginBottom: "32px",
        }}>
          {emoji} {article.title}
        </h1>

        {/* Main content card — Rundown newsletter style */}
        <div style={{
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          padding: "28px 28px",
          marginBottom: "16px",
        }}>

          {/* WHAT — inline bold prefix, Rundown style */}
          {hasLLM && what && (
            <p style={{ fontSize: "16px", color: "#a1a1aa", lineHeight: 1.75, marginBottom: "20px" }}>
              <strong style={{ color: "#ffffff", fontWeight: 700 }}>The Signal: </strong>
              {what}
            </p>
          )}

          {/* WHY — inline bold prefix */}
          {hasLLM && why && (
            <p style={{ fontSize: "16px", color: "#a1a1aa", lineHeight: 1.75, marginBottom: "20px" }}>
              <strong style={{ color: "#ffffff", fontWeight: 700 }}>Why it matters: </strong>
              {why}
            </p>
          )}

          {/* TAKEAWAY — amber left border, our differentiator */}
          {hasLLM && takeaway && (
            <div style={{
              borderLeft: "2px solid rgba(245,158,11,0.5)",
              paddingLeft: "16px",
              marginTop: hasLLM ? "8px" : "0",
            }}>
              <p style={{ fontSize: "15px", color: "#f59e0b", lineHeight: 1.7, margin: 0 }}>
                <strong style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: "10px", opacity: 0.8 }}>
                  Takeaway
                </strong>
                {takeaway}
              </p>
            </div>
          )}

          {/* Fallback — show cleaned summary when no LLM */}
          {!hasLLM && cleanedSummary && (
            <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.75, margin: 0 }}>
              <strong style={{ color: "#ffffff", fontWeight: 700 }}>The Signal: </strong>
              {cleanedSummary}
            </p>
          )}

          {!hasLLM && !cleanedSummary && (
            <p style={{ fontSize: "15px", color: "#52525b", lineHeight: 1.75, margin: 0 }}>
              Full signal analysis not yet available. Read the original source for details.
            </p>
          )}
        </div>

        {/* Read original CTA */}
        <div style={{ marginBottom: "16px" }}>
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#f59e0b",
              color: "#0a0a0a",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 800,
              padding: "11px 20px",
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            Read original →
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${article.title.slice(0, 180)}${takeaway ? `\n\nTakeaway: ${takeaway.slice(0, 100)}…` : ""}`)}&url=${encodeURIComponent(article.link)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#a1a1aa",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              padding: "11px 20px",
              textDecoration: "none",
              marginLeft: "8px",
            }}
          >
            Share on 𝕏
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.link)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#a1a1aa",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              padding: "11px 20px",
              textDecoration: "none",
              marginLeft: "8px",
            }}
          >
            LinkedIn
          </a>
        </div>

        {/* Related signals */}
        {relatedArticles.length > 0 && (
          <div style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "8px",
            padding: "20px 24px",
          }}>
            <span style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3f3f46", marginBottom: "16px" }}>
              Related signals
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {relatedArticles.map((related, idx) => (
                <div key={related.id} style={{
                  paddingTop: idx === 0 ? "0" : "12px",
                  marginTop: idx === 0 ? "0" : "12px",
                  borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "16px",
                }}>
                  <Link href={`/article/${related.id}`} style={{
                    fontSize: "14px",
                    color: "#a1a1aa",
                    textDecoration: "none",
                    lineHeight: 1.45,
                    fontWeight: 500,
                    flex: 1,
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#a1a1aa"; }}
                  >
                    {related.title}
                  </Link>
                  <span style={{ fontSize: "10px", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
                    {related.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
