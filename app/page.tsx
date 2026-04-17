"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Brain, Cpu, DollarSign, RefreshCw, TrendingUp } from "lucide-react";
import { articles as mockArticles } from "@/lib/mockData";
import realNews from "@/lib/realNews.json";

type RealArticle = {
  id: string;
  source: string;
  title: string;
  link: string;
  date: string;
  summary: string;
  category?: string;
  image?: string;
};

/* ─── Utilities ─────────────────────────────────────────────────────────── */

function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + "…";
}

function isSummaryEmpty(summary: string) {
  if (!summary) return true;
  const clean = summary.replace(/\s+/g, " ").trim().toLowerCase();
  return (
    clean === "" ||
    clean === "no summary available" ||
    clean === "no summary available."
  );
}

function getWhyItMatters(title: string) {
  const t = title.toLowerCase();
  if (
    t.includes("funding") ||
    t.includes("raise") ||
    t.includes("million") ||
    t.includes("billion") ||
    t.includes("secures")
  )
    return "Signals capital conviction and rising competitive intensity in this AI segment.";
  if (
    t.includes("launch") ||
    t.includes("release") ||
    t.includes("rolls out") ||
    t.includes("introduces")
  )
    return "Shows product velocity — teams are racing to translate AI capability into user-facing experiences.";
  if (
    t.includes("model") ||
    t.includes("research") ||
    t.includes("embedding") ||
    t.includes("benchmark") ||
    t.includes("safety")
  )
    return "Highlights movement in core model capability, evaluation, or reliability.";
  if (
    t.includes("open source") ||
    t.includes("developer") ||
    t.includes("tool") ||
    t.includes("code") ||
    t.includes("sdk")
  )
    return "Points to momentum in the AI tooling stack that shapes how products get built and shipped.";
  if (
    t.includes("enterprise") ||
    t.includes("workplace") ||
    t.includes("business")
  )
    return "Reflects growing enterprise adoption and clearer paths from experimentation to operational value.";
  return "Represents a meaningful shift in the AI landscape that operators and builders should track.";
}

function getPersonalizedScore(
  article: RealArticle,
  bookmarks: string[],
  readArticles: string[]
) {
  let score = 0;
  if (bookmarks.includes(article.id)) score += 5;
  if (!readArticles.includes(article.id)) score += 2;
  const t = article.title.toLowerCase();
  if (t.includes("model")) score += 1;
  if (t.includes("open source")) score += 1;
  if (t.includes("enterprise")) score += 1;
  return score;
}

function getSignalScore(article: RealArticle): number {
  const t = article.title.toLowerCase();
  let score = 3.2;
  if (
    t.includes("model") ||
    t.includes("research") ||
    t.includes("benchmark") ||
    t.includes("safety")
  )
    score += 0.8;
  if (
    t.includes("funding") ||
    t.includes("million") ||
    t.includes("billion") ||
    t.includes("secures")
  )
    score += 0.6;
  if (t.includes("open source") || t.includes("sdk") || t.includes("developer"))
    score += 0.4;
  if (t.includes("launch") || t.includes("release") || t.includes("introduces"))
    score += 0.3;
  if (article.source === "MIT Technology Review AI") score += 0.2;
  return Math.min(score, 5.0);
}

function getSignalScoreStr(article: RealArticle): string {
  return getSignalScore(article).toFixed(1);
}

function getContentType(
  article: RealArticle
): "Research" | "Product" | "Funding" | "Infra" {
  const t = article.title.toLowerCase();
  if (
    t.includes("funding") ||
    t.includes("raise") ||
    t.includes("million") ||
    t.includes("billion") ||
    t.includes("secures")
  )
    return "Funding";
  if (
    t.includes("model") ||
    t.includes("research") ||
    t.includes("benchmark") ||
    t.includes("safety") ||
    t.includes("embedding")
  )
    return "Research";
  if (
    t.includes("open source") ||
    t.includes("developer") ||
    t.includes("sdk") ||
    t.includes("api") ||
    t.includes("infrastructure")
  )
    return "Infra";
  return "Product";
}

function getPillClass(type: string): string {
  if (type === "Research") return "pill pill-research";
  if (type === "Funding") return "pill pill-funding";
  if (type === "Infra") return "pill pill-infra";
  if (type === "Policy") return "pill pill-policy";
  return "pill pill-product";
}

function getBarClass(score: number): string {
  if (score >= 4.0) return "sig-bar sig-bar-green";
  if (score >= 3.5) return "sig-bar sig-bar-violet";
  return "sig-bar sig-bar-indigo";
}

function getBarWidth(score: number): number {
  if (score >= 4.0) return 32;
  if (score >= 3.7) return 29;
  if (score >= 3.4) return 26;
  if (score >= 3.1) return 24;
  return 22;
}

function getSourceDotColor(source: string): string {
  if (source.toLowerCase().includes("hugging")) return "#3b82f6";
  if (source.toLowerCase().includes("venturebeat")) return "#8b5cf6";
  if (source.toLowerCase().includes("mit")) return "#06b6d4";
  return "#4b5563";
}

function ContentTypeIcon({ type }: { type: string }) {
  if (type === "Research") return <Brain className="h-3 w-3" />;
  if (type === "Funding") return <DollarSign className="h-3 w-3" />;
  if (type === "Infra") return <Cpu className="h-3 w-3" />;
  return <TrendingUp className="h-3 w-3" />;
}

function generateDailyBrief(articles: RealArticle[]) {
  if (articles.length === 0)
    return "No major signals available right now. Try refreshing to pull the latest AI developments.";
  const titles = articles.map((a) => a.title.toLowerCase());
  const hasFunding = titles.some(
    (t) =>
      t.includes("funding") ||
      t.includes("raise") ||
      t.includes("million") ||
      t.includes("billion") ||
      t.includes("secures")
  );
  const hasLaunches = titles.some(
    (t) =>
      t.includes("launch") ||
      t.includes("release") ||
      t.includes("introduces") ||
      t.includes("rolls out")
  );
  const hasResearch = titles.some(
    (t) =>
      t.includes("model") ||
      t.includes("research") ||
      t.includes("embedding") ||
      t.includes("benchmark") ||
      t.includes("safety")
  );
  const hasEnterprise = titles.some(
    (t) =>
      t.includes("enterprise") || t.includes("workplace") || t.includes("business")
  );
  const hasOpenSource = titles.some(
    (t) =>
      t.includes("open source") ||
      t.includes("developer") ||
      t.includes("tool") ||
      t.includes("code") ||
      t.includes("sdk")
  );
  const themes: string[] = [];
  if (hasLaunches) themes.push("rapid product shipping");
  if (hasResearch) themes.push("continued model and research progress");
  if (hasEnterprise) themes.push("stronger enterprise adoption");
  if (hasOpenSource) themes.push("momentum in the tooling and open ecosystem");
  if (hasFunding) themes.push("fresh capital flowing into AI infrastructure and applications");
  if (themes.length === 0)
    return "Today's signal set suggests steady movement across the AI landscape, with incremental developments that matter for builders, operators, and product teams.";
  const themeText =
    themes.length === 1
      ? themes[0]
      : themes.length === 2
      ? `${themes[0]} and ${themes[1]}`
      : `${themes.slice(0, -1).join(", ")}, and ${themes[themes.length - 1]}`;
  return `Today's AI brief points to ${themeText}. The strongest signal is not any single headline, but the combined pace of ecosystem movement — where capability advances, productization, and commercialization are increasingly happening in parallel.`;
}

/* ─── News Card ──────────────────────────────────────────────────────────── */

function NewsCard({
  article,
  isRead,
  isBookmarked,
  onRead,
  onBookmark,
}: {
  article: RealArticle;
  isRead: boolean;
  isBookmarked: boolean;
  onRead: () => void;
  onBookmark: () => void;
}) {
  const type = getContentType(article);
  const score = getSignalScore(article);
  const noSummary = isSummaryEmpty(article.summary);

  return (
    <article className={`news-card${isRead ? " read" : ""}`}>
      <div className="news-card-glow" aria-hidden="true" />

      <div style={{ position: "relative" }}>
        {/* Top row: badge + source + score bar */}
        <div className="card-top-row">
          <div className="card-meta-left">
            <span className={getPillClass(type)}>
              <ContentTypeIcon type={type} />
              {type}
            </span>
            <span className="card-source-name">
              <span
                className="source-dot"
                style={{ background: getSourceDotColor(article.source) }}
              />
              {article.source}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
            <span
              className={getBarClass(score)}
              style={{ width: `${getBarWidth(score)}px` }}
            />
            <span className="sig-num">{score.toFixed(1)}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="card-title">{article.title}</h4>

        {/* Summary */}
        {noSummary ? (
          <p className="card-no-summary">Summary not available</p>
        ) : (
          <p className="card-summary">{truncateText(article.summary, 160)}</p>
        )}

        {/* WHY IT MATTERS */}
        <div className="why-block">
          <span className="why-label">Why it matters</span>
          <p className="why-text">{getWhyItMatters(article.title)}</p>
        </div>

        {/* Footer */}
        <div className="card-footer">
          <Link
            href={`/article/${article.id}`}
            onClick={onRead}
            className="card-read-link"
          >
            Read →
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onBookmark();
            }}
            className={`card-star${isBookmarked ? " saved" : ""}`}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? "★" : "☆"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = [
    "All",
    "Hugging Face",
    "VentureBeat AI",
    "MIT Technology Review AI",
  ];

  useEffect(() => {
    const saved = localStorage.getItem("bookmarks_real");
    const read = localStorage.getItem("read_articles");
    try {
      if (saved) setBookmarks(JSON.parse(saved));
      if (read) setReadArticles(JSON.parse(read));
    } catch {
      setBookmarks([]);
      setReadArticles([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookmarks_real", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("read_articles", JSON.stringify(readArticles));
  }, [readArticles]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const markAsRead = (id: string) => {
    if (!readArticles.includes(id)) setReadArticles((prev) => [...prev, id]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => window.location.reload(), 600);
  };

  const featuredArticle = mockArticles[0];
  const query = search.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    return (realNews as RealArticle[])
      .filter((article) => {
        const matchesSearch =
          query === "" ||
          article.title.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query) ||
          (article.category || "").toLowerCase().includes(query);
        const matchesCategory =
          selectedCategory === "All" || article.source === selectedCategory;
        const matchesReadFilter =
          !showUnreadOnly || !readArticles.includes(article.id);
        return matchesSearch && matchesCategory && matchesReadFilter;
      })
      .sort(
        (a, b) =>
          getPersonalizedScore(b, bookmarks, readArticles) -
          getPersonalizedScore(a, bookmarks, readArticles)
      );
  }, [query, selectedCategory, showUnreadOnly, readArticles, bookmarks]);

  const topSignals = useMemo(() => filteredArticles.slice(0, 5), [filteredArticles]);
  const dailyBrief = useMemo(() => generateDailyBrief(topSignals), [topSignals]);

  return (
    <>
      {/* ── Sticky Navbar ── */}
      <nav className="nav-wrapper">
        {/* Brand */}
        <div style={{ flex: 1 }}>
          <p className="nav-eyebrow">
            <span className="nav-eyebrow-dot" aria-hidden="true" />
            AI Intelligence Feed
          </p>
          <span className="nav-logo">AI Signal</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="text"
            placeholder="Search signals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="nav-search"
          />

          <Link href="/saved" className="nav-btn">
            Saved
            {bookmarks.length > 0 && (
              <span className="saved-badge">{bookmarks.length}</span>
            )}
          </Link>

          <button onClick={handleRefresh} className="nav-btn">
            <RefreshCw
              style={{ width: "12px", height: "12px" }}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </nav>

      {/* ── Filter Pills ── */}
      <div className="filters-bar">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSelectedCategory(item)}
            className={`filter-pill${selectedCategory === item ? " active" : ""}`}
          >
            {item}
          </button>
        ))}

        <button
          onClick={() => setShowUnreadOnly((prev) => !prev)}
          className={`filter-pill${showUnreadOnly ? " active" : ""}`}
        >
          {showUnreadOnly ? "Showing Unread" : "Unread Only"}
        </button>
      </div>

      <main>
        {/* ── Hero Featured Card ── */}
        <Link
          href={topSignals.length > 0 ? `/article/${topSignals[0].id}` : "/"}
          className="hero-wrapper"
        >
          <div className="hero-mesh" aria-hidden="true" />
          <div className="hero-orb-1" aria-hidden="true" />
          <div className="hero-orb-2" aria-hidden="true" />

          <div className="hero-content">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
              <span className="hero-badge-frosted">Featured Signal</span>
              {topSignals.length > 0 && (
                <span className="hero-badge-score">
                  {getSignalScoreStr(topSignals[0])} Signal
                </span>
              )}
              {topSignals.length > 0 && (
                <span className="hero-source-label">{topSignals[0].source}</span>
              )}
            </div>

            <h2 className="hero-title">{featuredArticle.title}</h2>
            <p className="hero-summary">{featuredArticle.summary}</p>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
              <button className="hero-cta">Read full story →</button>
              <p className="hero-insight">{featuredArticle.whyItMatters}</p>
            </div>
          </div>
        </Link>

        {/* ── Daily AI Brief ── */}
        <div className="brief-wrapper">
          <div className="brief-orb" aria-hidden="true" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="brief-eyebrow">
              <span className="brief-pulse" />
              DAILY AI BRIEF
            </div>
            <h3 className="brief-title">What matters today</h3>
            <p className="brief-body">{dailyBrief}</p>
          </div>
        </div>

        {/* ── Top Signals Section Header ── */}
        <div className="section-header">
          <div>
            <h3 className="section-title">Top Signals Today</h3>
            <div className="section-rule" />
            <p className="section-sub">Most relevant developments right now</p>
          </div>
          <span className="section-badge">{topSignals.length} signals</span>
        </div>

        {/* ── Top Signals List ── */}
        <div className="top-list">
          {topSignals.map((article, index) => {
            const score = getSignalScore(article);
            return (
              <div key={article.id} className="top-row">
                <span className="top-num">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <div className="top-source">
                    <span
                      className="source-dot"
                      style={{ background: getSourceDotColor(article.source) }}
                    />
                    {article.source}
                  </div>
                  <h4 className="top-title">{article.title}</h4>
                </div>

                <div className="top-right">
                  <span
                    className={getBarClass(score)}
                    style={{ width: `${getBarWidth(score)}px` }}
                  />
                  <span className="sig-num">{score.toFixed(1)}</span>
                  <span className="sig-label">SIGNAL</span>
                  <Link
                    href={`/article/${article.id}`}
                    onClick={() => markAsRead(article.id)}
                    className="top-read"
                  >
                    Read →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Latest Signals Header ── */}
        <div className="section-header">
          <div>
            <h3 className="section-title">Latest Signals</h3>
            <div className="section-rule" />
            <p className="section-sub">Real AI news pulled from live feeds</p>
          </div>
          <span className="section-badge">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Article Feed ── */}
        {filteredArticles.length > 0 ? (
          <>
            {filteredArticles.slice(0, 2).length > 0 && (
              <div className="cards-grid-2">
                {filteredArticles.slice(0, 2).map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    isRead={readArticles.includes(article.id)}
                    isBookmarked={bookmarks.includes(article.id)}
                    onRead={() => markAsRead(article.id)}
                    onBookmark={() => toggleBookmark(article.id)}
                  />
                ))}
              </div>
            )}
            {filteredArticles.slice(2).length > 0 && (
              <div className="cards-grid-3">
                {filteredArticles.slice(2).map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    isRead={readArticles.includes(article.id)}
                    isBookmarked={bookmarks.includes(article.id)}
                    onRead={() => markAsRead(article.id)}
                    onBookmark={() => toggleBookmark(article.id)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              margin: "0 32px",
              background: "#0d0e17",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "13px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#f0f2ff" }}>
              No results found
            </p>
            <p style={{ fontSize: "12px", color: "#374151", marginTop: "6px" }}>
              Try another keyword, company name, topic, or source.
            </p>
          </div>
        )}

        {/* ── Footer ── */}
        <footer style={{ marginTop: "48px" }}>
          <div className="page-footer">
            <div>
              <p className="footer-logo">AI Signal</p>
              <p className="footer-sub">
                {filteredArticles.length} signals tracked · updated daily
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <Link href="/saved" className="footer-link">
                Saved articles ({bookmarks.length})
              </Link>
              <button onClick={handleRefresh} className="footer-link">
                Refresh feed
              </button>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
