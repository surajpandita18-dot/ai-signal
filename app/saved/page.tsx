"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import realNews from "@/lib/realNews.json";

type RealArticle = {
  id: string;
  source: string;
  title: string;
  link: string;
  date: string;
  summary: string;
  category?: string;
};

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

function getSourceDotColor(source: string): string {
  if (source.toLowerCase().includes("hugging")) return "#3b82f6";
  if (source.toLowerCase().includes("venturebeat")) return "#8b5cf6";
  if (source.toLowerCase().includes("mit")) return "#06b6d4";
  return "#4b5563";
}

function getCategoryBadgeStyle(category: string): React.CSSProperties {
  const t = category.toLowerCase();
  if (t.includes("research") || t.includes("model"))
    return {
      background: "rgba(59,130,246,0.10)",
      color: "#93c5fd",
      border: "1px solid rgba(59,130,246,0.2)",
    };
  if (t.includes("funding"))
    return {
      background: "rgba(245,158,11,0.10)",
      color: "#fbbf24",
      border: "1px solid rgba(245,158,11,0.2)",
    };
  return {
    background: "rgba(139,92,246,0.10)",
    color: "#c4b5fd",
    border: "1px solid rgba(139,92,246,0.2)",
  };
}

function SavedCard({
  article,
  onToggleBookmark,
}: {
  article: RealArticle;
  onToggleBookmark: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const noSummary = isSummaryEmpty(article.summary);
  const catStyle = getCategoryBadgeStyle(article.category || "");

  return (
    <article
      style={{
        background: hovered ? "#101220" : "#0d0e17",
        border: `1px solid ${hovered ? "rgba(124,58,237,0.30)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "13px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 14px 36px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.08)"
          : "none",
        transition:
          "transform 0.2s, box-shadow 0.2s, border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow orb */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-55px",
          right: "-55px",
          width: "170px",
          height: "170px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)",
          pointerEvents: "none",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />

      <div style={{ position: "relative" }}>
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span
              style={{
                ...catStyle,
                borderRadius: "20px",
                fontSize: "9px",
                fontWeight: 600,
                padding: "3px 8px",
              }}
            >
              {article.category || "AI News"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  display: "inline-block",
                  background: getSourceDotColor(article.source),
                }}
              />
              <span style={{ fontSize: "10px", color: "#374151", fontWeight: 600 }}>
                {article.source}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleBookmark}
            style={{
              fontSize: "12px",
              color: "#a78bfa",
              cursor: "pointer",
              background: "none",
              border: "none",
              flexShrink: 0,
            }}
            aria-label="Remove bookmark"
          >
            ★
          </button>
        </div>

        {/* Date */}
        <p style={{ fontSize: "9px", color: "#2d3748", marginBottom: "6px" }}>
          {article.date}
        </p>

        {/* Title */}
        <h2
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#f0f2ff",
            lineHeight: 1.42,
            marginBottom: "7px",
            letterSpacing: "-.005em",
          }}
        >
          {article.title}
        </h2>

        {/* Summary */}
        {noSummary ? (
          <p
            style={{
              fontSize: "11px",
              color: "#374151",
              fontStyle: "italic",
              marginBottom: "12px",
            }}
          >
            Summary not available
          </p>
        ) : (
          <p
            style={{
              fontSize: "11px",
              color: "#8892b0",
              lineHeight: 1.65,
              marginBottom: "12px",
            }}
          >
            {truncateText(article.summary, 220)}
          </p>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span style={{ fontSize: "10px", color: "#374151" }}>Saved signal</span>
          <Link
            href={`/article/${article.id}`}
            style={{
              fontSize: "11px",
              color: "#a78bfa",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function SavedPage() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bookmarks_real");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch {
        setBookmarks([]);
      }
    }
    setIsLoaded(true);
  }, []);

  const toggleBookmark = (id: string) => {
    const updated = bookmarks.includes(id)
      ? bookmarks.filter((item) => item !== id)
      : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem("bookmarks_real", JSON.stringify(updated));
  };

  const query = search.trim().toLowerCase();

  const savedArticles = useMemo(() => {
    return (realNews as RealArticle[])
      .filter((article) => bookmarks.includes(article.id))
      .filter((article) => {
        if (query === "") return true;
        return (
          article.title.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query) ||
          (article.category || "").toLowerCase().includes(query)
        );
      });
  }, [bookmarks, query]);

  if (!isLoaded) {
    return (
      <main style={{ minHeight: "100vh" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "80px 28px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "#374151" }}>Loading saved articles…</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(8,9,15,0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          height: "60px",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "9px",
              letterSpacing: ".2em",
              color: "#374151",
              fontWeight: 600,
              marginBottom: "1px",
            }}
          >
            Your Collection
          </p>
          <h1
            className="gradient-text"
            style={{ fontSize: "17px", fontWeight: 800, letterSpacing: "-.02em" }}
          >
            Saved Articles
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="text"
            placeholder="Search saved…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "7px",
              color: "#9aa5b4",
              fontSize: "12px",
              padding: "7px 13px",
              width: "200px",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <Link
            href="/"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "7px",
              color: "#6b7a99",
              fontSize: "11px",
              fontWeight: 500,
              padding: "7px 13px",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
        </div>
      </nav>

      <main style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px" }}>
          <p style={{ fontSize: "12px", color: "#374151", marginBottom: "24px" }}>
            {savedArticles.length} saved article{savedArticles.length !== 1 ? "s" : ""}
          </p>

          {savedArticles.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: "14px",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              }}
            >
              {savedArticles.map((article) => (
                <SavedCard
                  key={article.id}
                  article={article}
                  onToggleBookmark={() => toggleBookmark(article.id)}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "#0d0e17",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "13px",
                padding: "60px 40px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#f0f2ff" }}>
                {search.trim() === ""
                  ? "No saved articles yet"
                  : "No matching saved articles"}
              </p>
              <p style={{ fontSize: "12px", color: "#374151", marginTop: "6px" }}>
                {search.trim() === ""
                  ? "Bookmark articles from the homepage and they will appear here."
                  : "Try another keyword or clear your search."}
              </p>
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                  background: "#7c3aed",
                  color: "#fff",
                  borderRadius: "22px",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "10px 22px",
                  textDecoration: "none",
                }}
              >
                Explore articles
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
