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

const CATEGORY_COLOR: Record<string, string> = {
  llm: "#7c3aed", models: "#7c3aed", research: "#2563eb", infra: "#059669",
  infrastructure: "#059669", funding: "#d97706", product: "#dc2626",
  agents: "#7c3aed", "open source": "#0891b2", policy: "#6b7280",
};

function getEmoji(tags: string[]): string {
  return tags.map((t) => CATEGORY_EMOJI[t.toLowerCase()]).find(Boolean) ?? "📡";
}

function getCategoryColor(tags: string[]): string {
  return tags.map((t) => CATEGORY_COLOR[t.toLowerCase()]).find(Boolean) ?? "#52525b";
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
  const catColor = getCategoryColor(articleTags);
  const catLabel = articleTags[0]?.toUpperCase() ?? "";

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
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ffffff" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#0a0a0a",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: "52px", padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/app" style={{ textDecoration: "none" }}>
          <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "0.06em", color: "#ffffff" }}>
            ● AI SIGNAL
          </span>
        </Link>
        <Link href="/app" style={{ fontSize: "13px", color: "#52525b", textDecoration: "none", fontWeight: 500 }}>
          ← Back to feed
        </Link>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px 96px" }}>

        {/* Category + meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {catLabel && (
            <span style={{
              fontSize: "11px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em",
              color: catColor,
            }}>
              {catLabel}
            </span>
          )}
          {catLabel && <span style={{ color: "#27272a" }}>·</span>}
          <span style={{ fontSize: "11px", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
            {article.source}
          </span>
          <span style={{ color: "#27272a" }}>·</span>
          <span style={{ fontSize: "11px", color: "#3f3f46" }}>
            {new Date(article.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(22px, 4vw, 32px)",
          fontWeight: 800, color: "#ffffff",
          lineHeight: 1.2, letterSpacing: "-0.025em",
          marginBottom: "32px",
        }}>
          {emoji} {article.title}
        </h1>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "32px" }} />

        {/* THE SIGNAL */}
        {(hasLLM ? what : cleanedSummary) && (
          <div style={{ marginBottom: "28px" }}>
            <p style={{
              fontSize: "11px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em",
              color: "#52525b", margin: "0 0 10px",
            }}>
              The Signal
            </p>
            <p style={{ fontSize: "16px", color: "#a1a1aa", lineHeight: 1.8, margin: 0 }}>
              {hasLLM ? what : cleanedSummary}
            </p>
          </div>
        )}

        {/* WHY IT MATTERS */}
        {hasLLM && why && (
          <div style={{ marginBottom: "28px" }}>
            <p style={{
              fontSize: "11px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em",
              color: "#52525b", margin: "0 0 10px",
            }}>
              Why it matters
            </p>
            <p style={{ fontSize: "16px", color: "#a1a1aa", lineHeight: 1.8, margin: 0 }}>
              {why}
            </p>
          </div>
        )}

        {/* BUILDER TAKEAWAY */}
        {hasLLM && takeaway && (
          <>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "28px 0" }} />
            <div style={{
              borderLeft: "2px solid rgba(245,158,11,0.5)",
              paddingLeft: "16px", marginBottom: "32px",
            }}>
              <p style={{
                fontSize: "11px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.12em",
                color: "#f59e0b", margin: "0 0 10px",
              }}>
                Builder Takeaway
              </p>
              <p style={{ fontSize: "16px", color: "#f59e0b", lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                {takeaway}
              </p>
            </div>
          </>
        )}

        {!hasLLM && !cleanedSummary && (
          <p style={{ fontSize: "15px", color: "#52525b", lineHeight: 1.75, marginBottom: "32px" }}>
            Full signal analysis not yet available.
          </p>
        )}

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "24px" }} />

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", marginBottom: "56px" }}>
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: "14px", fontWeight: 700,
              color: "#ffffff", textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,0.25)",
              textUnderlineOffset: "3px",
            }}
          >
            Read original source ↗
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title.slice(0, 180))}&url=${encodeURIComponent(article.link)}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "13px", color: "#52525b", textDecoration: "none", fontWeight: 500 }}
          >
            Share on 𝕏
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.link)}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "13px", color: "#52525b", textDecoration: "none", fontWeight: 500 }}
          >
            LinkedIn
          </a>
        </div>

        {/* Related signals */}
        {relatedArticles.length > 0 && (
          <>
            <p style={{
              fontSize: "11px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em",
              color: "#3f3f46", marginBottom: "16px",
            }}>
              Related Signals
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {relatedArticles.map((related, idx) => (
                <div key={related.id} style={{
                  paddingTop: idx === 0 ? "0" : "16px",
                  marginTop: idx === 0 ? "0" : "16px",
                  borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "16px",
                }}>
                  <Link
                    href={`/article/${related.id}`}
                    style={{
                      fontSize: "14px", color: "#a1a1aa",
                      textDecoration: "none", lineHeight: 1.5,
                      fontWeight: 500, flex: 1,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#a1a1aa"; }}
                  >
                    {getEmoji(related.tags ?? [])} {related.title}
                  </Link>
                  <span style={{ fontSize: "10px", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
                    {related.source}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
