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
  summary: string | null;
  category?: string;
  tags?: string[] | null;
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
  return tags.map((t) => CATEGORY_COLOR[t.toLowerCase()]).find(Boolean) ?? "#6b7280";
}

function cleanSummary(summary: string | null | undefined): string {
  if (!summary) return "";
  return summary
    .replace(/arXiv:\S+\s+Announce Type:\s+\w+\s+Abstract:\s*/i, "")
    .replace(/^Abstract:\s*/i, "")
    .trim();
}

function normalizeId(value: string): string {
  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}

function loadProcessedSignals(): Signal[] {
  try {
    const filePath = path.join(process.cwd(), "lib", "processedSignals.json");
    if (!existsSync(filePath)) return [];
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Signal[];
  } catch {
    return [];
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
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
  const articleTags: string[] = (article?.tags ?? processed?.tags ?? []).filter(Boolean) as string[];
  const emoji = getEmoji(articleTags);
  const catColor = getCategoryColor(articleTags);
  const catLabel = articleTags[0]?.toUpperCase() ?? "";
  const cleanedSummary = cleanSummary(article?.summary);

  if (!article) {
    return (
      <main style={{ minHeight: "100vh", background: "#ffffff" }}>
        <nav style={{
          background: "#111111", height: "56px", padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <Link href="/brief" style={{ fontWeight: 800, fontSize: "15px", color: "#ffffff", textDecoration: "none" }}>
            AI Signal
          </Link>
          <Link href="/brief" style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "none" }}>← Feed</Link>
        </nav>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 24px" }}>
          <p style={{ fontSize: "16px", color: "#6b7280", lineHeight: 1.6 }}>
            This signal couldn&apos;t be found — it may have expired or moved.{" "}
            <Link href="/brief" style={{ color: "#111111", fontWeight: 600 }}>View today&apos;s feed →</Link>
          </p>
        </div>
      </main>
    );
  }

  // Related signals — safe, with null guards
  const relatedArticles: RealArticle[] = [];
  if (articleTags.length > 0) {
    const candidates = processedSignals.filter(
      (s) => s.id && normalizeId(s.id) !== normalizedRouteId &&
             Array.isArray(s.tags) && s.tags.some((t) => articleTags.includes(t))
    );
    for (const c of candidates.slice(0, 3)) {
      const raw = realNews.find((r) => normalizeId(r.id) === normalizeId(c.id));
      if (raw) relatedArticles.push(raw);
    }
    if (relatedArticles.length < 3) {
      for (const r of realNews) {
        if (relatedArticles.length >= 3) break;
        if (normalizeId(r.id) === normalizedRouteId) continue;
        if (relatedArticles.some((a) => a.id === r.id)) continue;
        if (Array.isArray(r.tags) && r.tags.some((t) => articleTags.includes(t))) {
          relatedArticles.push(r);
        }
      }
    }
  }

  const formattedDate = (() => {
    try {
      return new Date(article.date).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });
    } catch {
      return article.date;
    }
  })();

  return (
    <main style={{ minHeight: "100vh", background: "#ffffff" }}>

      {/* Dark navbar — Rundown style */}
      <nav style={{
        background: "#111111", height: "56px", padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/brief" style={{ fontWeight: 800, fontSize: "15px", color: "#ffffff", textDecoration: "none", letterSpacing: "0.03em" }}>
          AI Signal
        </Link>
        <Link href="/brief" style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "none", fontWeight: 500 }}>
          ← Feed
        </Link>
      </nav>

      <article style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px 96px" }}>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px", flexWrap: "wrap" }}>
          <Link href="/brief" style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "none" }}>Feed</Link>
          <span style={{ color: "#d1d5db", fontSize: "13px" }}>›</span>
          {catLabel && (
            <>
              <span style={{ fontSize: "13px", color: catColor, fontWeight: 600 }}>{catLabel}</span>
              <span style={{ color: "#d1d5db", fontSize: "13px" }}>›</span>
            </>
          )}
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            {article.title.length > 48 ? article.title.slice(0, 48) + "…" : article.title}
          </span>
        </nav>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(26px, 4vw, 38px)",
          fontWeight: 800, color: "#111111",
          lineHeight: 1.15, letterSpacing: "-0.025em",
          marginBottom: "16px",
        }}>
          {emoji} {article.title}
        </h1>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "36px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", color: "#374151", fontWeight: 600 }}>{article.source}</span>
          <span style={{ color: "#e5e7eb" }}>·</span>
          <span style={{ fontSize: "13px", color: "#9ca3af" }}>{formattedDate}</span>
          {catLabel && (
            <>
              <span style={{ color: "#e5e7eb" }}>·</span>
              <span style={{
                fontSize: "11px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: catColor,
              }}>
                {catLabel}
              </span>
            </>
          )}
        </div>

        {/* ── CONTENT — open editorial layout, no card wrappers ── */}

        <div style={{ height: "1px", background: "#e5e7eb", marginBottom: "32px" }} />

        {/* The Signal */}
        {(hasLLM ? what : cleanedSummary) && (
          <section style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "16px", color: "#1f2937", lineHeight: 1.85, margin: 0 }}>
              <strong>The Signal: </strong>
              {hasLLM ? what : cleanedSummary}
            </p>
          </section>
        )}

        {/* Why it matters */}
        {hasLLM && why && (
          <section style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "16px", color: "#1f2937", lineHeight: 1.85, margin: 0 }}>
              <strong>Why it matters: </strong>
              {why}
            </p>
          </section>
        )}

        {!hasLLM && !cleanedSummary && (
          <p style={{ fontSize: "15px", color: "#9ca3af", lineHeight: 1.75, marginBottom: "28px" }}>
            Full analysis not yet available for this signal.
          </p>
        )}

        {/* Builder Takeaway */}
        {hasLLM && takeaway && (
          <>
            <div style={{ height: "1px", background: "#e5e7eb", marginBottom: "24px" }} />
            <section style={{
              borderLeft: "3px solid #f59e0b",
              paddingLeft: "20px",
              marginBottom: "32px",
            }}>
              <p style={{
                fontSize: "11px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#d97706", margin: "0 0 10px",
              }}>
                Builder Takeaway
              </p>
              <p style={{ fontSize: "16px", color: "#374151", lineHeight: 1.8, margin: 0, fontWeight: 500 }}>
                {takeaway}
              </p>
            </section>
          </>
        )}

        <div style={{ height: "1px", background: "#e5e7eb", marginBottom: "24px" }} />

        {/* Action links */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", marginBottom: "56px" }}>
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: "14px", fontWeight: 700, color: "#111111",
              textDecoration: "underline",
              textDecorationColor: "#d1d5db",
              textUnderlineOffset: "3px",
            }}
          >
            Read original ↗
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title.slice(0, 200))}&url=${encodeURIComponent(article.link)}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "none" }}
          >
            Share on 𝕏
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(article.link)}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "none" }}
          >
            LinkedIn
          </a>
        </div>

        {/* Related signals */}
        {relatedArticles.length > 0 && (
          <section>
            <p style={{
              fontSize: "11px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em",
              color: "#9ca3af", marginBottom: "20px",
            }}>
              Related Signals
            </p>
            <div>
              {relatedArticles.map((related, idx) => (
                <div key={related.id} style={{
                  paddingTop: idx === 0 ? "0" : "16px",
                  marginTop: idx === 0 ? "0" : "16px",
                  borderTop: idx === 0 ? "none" : "1px solid #f3f4f6",
                  display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", gap: "16px",
                }}>
                  <Link
                    href={`/article/${related.id}`}
                    style={{ fontSize: "14px", color: "#374151", textDecoration: "none", lineHeight: 1.5, fontWeight: 500, flex: 1 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#111111"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#374151"; }}
                  >
                    {getEmoji(related.tags ?? [])} {related.title}
                  </Link>
                  <span style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
                    {related.source}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
