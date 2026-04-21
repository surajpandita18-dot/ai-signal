import Link from "next/link";
import { existsSync, readFileSync } from "fs";
import path from "path";
import realNewsRaw from "@/lib/realNews.json";
import { auth } from "@/lib/auth";
import type { Signal } from "@/lib/types";

// ── Local type for raw realNews entries ──────────────────────────────────────
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

// ── Helpers (keep) ───────────────────────────────────────────────────────────
function splitSummary(summary: string) {
  const clean = summary.replace(/\s+/g, " ").trim();
  if (
    !clean ||
    clean.toLowerCase() === "no summary available" ||
    clean.toLowerCase() === "no summary available."
  )
    return [];
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const paragraphs: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > 260) {
      if (current.trim()) paragraphs.push(current.trim());
      current = sentence;
    } else {
      current = `${current} ${sentence}`.trim();
    }
  }
  if (current.trim()) paragraphs.push(current.trim());
  return paragraphs;
}

function getFallbackArticleNote(article: RealArticle) {
  return `This signal was pulled from ${article.source}. A full summary was not available in the feed, but the headline suggests a development worth tracking under ${
    article.category || "AI News"
  }. Use the original source link below to read the complete piece.`;
}

function normalizeId(value: string) {
  return decodeURIComponent(value).trim().toLowerCase();
}

// ── Load processedSignals once (may not exist) ───────────────────────────────
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const normalizedRouteId = normalizeId(id);

  const session = await auth();
  const isPaid =
    (session?.user as { plan?: string } | undefined)?.plan === "paid";

  // Load data
  const realNews = realNewsRaw as RealArticle[];
  const processedSignals = loadProcessedSignals();

  // Find article
  const article = realNews.find(
    (item) => normalizeId(item.id) === normalizedRouteId
  );

  // Merge LLM fields from processedSignals if available
  const processed = processedSignals.find(
    (s) => normalizeId(s.id) === normalizedRouteId
  );

  const what = processed?.what ?? null;
  const why = processed?.why ?? null;
  const takeaway = processed?.takeaway ?? null;
  const hasLLM = !!(processed?.processed && (what || why || takeaway));
  const articleTags: string[] = article?.tags ?? processed?.tags ?? [];

  // ── Not found ──
  if (!article) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#09090b",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 28px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              color: "#52525b",
              fontSize: "11px",
              fontWeight: 500,
              padding: "7px 13px",
              textDecoration: "none",
              marginBottom: "32px",
            }}
          >
            ← Back to home
          </Link>
          <div
            style={{
              background: "#1a1a20",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#fafafa" }}>
              Article not found
            </h1>
            <p style={{ fontSize: "13px", color: "#52525b", marginTop: "8px" }}>
              This signal may have been removed, refreshed, or the route id may no longer
              match the latest feed.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const paragraphs = splitSummary(article.summary);

  // ── Related signals: up to 3 same-tag, not self ──
  const relatedArticles: RealArticle[] = [];
  if (articleTags.length > 0) {
    // Try processedSignals first for richer tag data, fall back to realNews
    const candidates =
      processedSignals.length > 0
        ? processedSignals.filter((s) => {
            if (normalizeId(s.id) === normalizedRouteId) return false;
            return s.tags?.some((t) => articleTags.includes(t));
          })
        : [];

    if (candidates.length > 0) {
      // Map processed back to RealArticle shape for display
      for (const c of candidates.slice(0, 3)) {
        const raw = realNews.find((r) => normalizeId(r.id) === normalizeId(c.id));
        if (raw) relatedArticles.push(raw);
      }
    } else {
      // Fall back to realNews tag matching
      for (const r of realNews) {
        if (relatedArticles.length >= 3) break;
        if (normalizeId(r.id) === normalizedRouteId) continue;
        const rTags: string[] = r.tags ?? [];
        if (rTags.some((t) => articleTags.includes(t))) {
          relatedArticles.push(r);
        }
      }
    }
  }

  // ── Render ──
  return (
    <main style={{ minHeight: "100vh", background: "#09090b" }}>
      {/* Sticky navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(9,9,11,0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          height: "60px",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Link
          href="/"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            color: "#52525b",
            fontSize: "11px",
            fontWeight: 500,
            padding: "7px 13px",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "#52525b",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          {article.source}
        </span>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 28px" }}>
        <article>
          {/* ── Flat header block ── */}
          <div
            style={{
              background: "#1a1a20",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "36px 40px",
              marginBottom: "16px",
            }}
          >
            {/* Source + date labels */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#52525b",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {article.source}
              </span>
              <span style={{ color: "#27272a" }}>·</span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#52525b",
                  letterSpacing: "0.08em",
                }}
              >
                {article.date}
              </span>
              {article.category && (
                <>
                  <span style={{ color: "#27272a" }}>·</span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#52525b",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 500,
                    }}
                  >
                    {article.category}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#fafafa",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                maxWidth: "680px",
                margin: 0,
              }}
            >
              {article.title}
            </h1>
          </div>

          {/* ── LLM fields block ── */}
          {hasLLM && (
            <div
              style={{
                background: "#0f0f12",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "28px 32px",
                marginBottom: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* WHAT */}
              {what && (
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#52525b",
                      marginBottom: "6px",
                    }}
                  >
                    What
                  </span>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#a1a1aa",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {what}
                  </p>
                </div>
              )}

              {/* WHY */}
              {why && (
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#52525b",
                      marginBottom: "6px",
                    }}
                  >
                    Why
                  </span>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#a1a1aa",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {why}
                  </p>
                </div>
              )}

              {/* TAKEAWAY — amber, blurred for free */}
              {takeaway && (
                <div
                  style={{
                    borderLeft: "2px solid rgba(245,158,11,0.4)",
                    paddingLeft: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#f59e0b",
                      marginBottom: "4px",
                    }}
                  >
                    Takeaway
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "15px",
                      color: "#f59e0b",
                      lineHeight: 1.6,
                      filter: isPaid ? "none" : "blur(4px)",
                      userSelect: isPaid ? "auto" : "none",
                    }}
                  >
                    {takeaway}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Summary body ── */}
          <div
            style={{
              background: "#0f0f12",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "32px 36px",
              marginBottom: "16px",
            }}
          >
            {/* Signal Summary label */}
            <div
              style={{
                borderLeft: "2px solid #7c3aed",
                paddingLeft: "12px",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  color: "#52525b",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Signal Summary
              </p>
              <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
                {paragraphs.length > 0
                  ? article.summary
                  : "A detailed summary was not available in the source feed for this article."}
              </p>
            </div>

            {/* Paragraphs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
                  {getFallbackArticleNote(article)}
                </p>
              )}
            </div>
          </div>

          {/* ── Related signals ── */}
          {relatedArticles.length > 0 && (
            <div
              style={{
                background: "#0f0f12",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "24px 32px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#52525b",
                  marginBottom: "16px",
                }}
              >
                Related signals
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {relatedArticles.map((related, idx) => (
                  <div
                    key={related.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      padding: "12px 0",
                      borderTop:
                        idx === 0
                          ? "none"
                          : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <Link
                      href={`/article/${related.id}`}
                      style={{
                        fontSize: "15px",
                        color: "#fafafa",
                        textDecoration: "none",
                        fontWeight: 500,
                        lineHeight: 1.4,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {related.title}
                    </Link>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#52525b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 500,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {related.source}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          <div
            style={{
              background: "#0f0f12",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "24px 32px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <a
              href={article.link}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                background: "#7c3aed",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                padding: "10px 20px",
                textDecoration: "none",
              }}
            >
              Open original source →
            </a>
            <Link
              href="/saved"
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                color: "#52525b",
                fontSize: "13px",
                fontWeight: 500,
                padding: "10px 20px",
                textDecoration: "none",
              }}
            >
              Go to saved articles
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
