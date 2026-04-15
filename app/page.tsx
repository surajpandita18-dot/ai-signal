"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

function truncateText(text: string, maxLength: number) {
  if (!text) return "No summary available.";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + "…";
}

function getWhyItMatters(title: string) {
  const text = title.toLowerCase();

  if (
    text.includes("funding") ||
    text.includes("raise") ||
    text.includes("million") ||
    text.includes("billion") ||
    text.includes("secures")
  ) {
    return "Signals capital conviction and rising competitive intensity in this AI segment.";
  }

  if (
    text.includes("launch") ||
    text.includes("release") ||
    text.includes("rolls out") ||
    text.includes("introduces")
  ) {
    return "Shows product velocity — teams are racing to translate AI capability into user-facing experiences.";
  }

  if (
    text.includes("model") ||
    text.includes("research") ||
    text.includes("embedding") ||
    text.includes("benchmark") ||
    text.includes("safety")
  ) {
    return "Highlights movement in core model capability, evaluation, or reliability.";
  }

  if (
    text.includes("open source") ||
    text.includes("developer") ||
    text.includes("tool") ||
    text.includes("code") ||
    text.includes("sdk")
  ) {
    return "Points to momentum in the AI tooling stack that shapes how products get built and shipped.";
  }

  if (
    text.includes("enterprise") ||
    text.includes("workplace") ||
    text.includes("business")
  ) {
    return "Reflects growing enterprise adoption and clearer paths from experimentation to operational value.";
  }

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

  const title = article.title.toLowerCase();

  if (title.includes("model")) score += 1;
  if (title.includes("open source")) score += 1;
  if (title.includes("enterprise")) score += 1;

  return score;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const markAsRead = (id: string) => {
  if (!readArticles.includes(id)) {
    setReadArticles((prev) => [...prev, id]);
  }
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
  const topSignals = useMemo(() => {
  return filteredArticles.slice(0, 5);
}, [filteredArticles]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
                AI News Digest
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                AI Signal
              </h1>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Link
                href="/saved"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Saved
                <span className="ml-2 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-200">
                  {bookmarks.length}
                </span>
              </Link>

              <input
                type="text"
                placeholder="Search AI news..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none backdrop-blur-md md:w-80"
              />
               <button
    onClick={() => window.location.reload()}
    className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
  >
    Refresh
  </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSelectedCategory(item)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selectedCategory === item
                    ? "border-purple-400/40 bg-purple-500/15 text-white"
                    : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
            <button
    onClick={() => setShowUnreadOnly((prev) => !prev)}
    className={`rounded-full border px-4 py-2 text-sm transition ${
      showUnreadOnly
        ? "border-cyan-400/40 bg-cyan-500/15 text-white"
        : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
    }`}
  >
    {showUnreadOnly ? "Showing Unread" : "Unread Only"}
  </button>
          </div>
        </header>

        {/* Hero */}
        <Link
          href="/article/1"
          className="group relative mb-10 block overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-700/40 via-zinc-900 to-blue-700/30 shadow-2xl transition hover:border-white/20"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          <div className="relative z-10 p-8 md:p-10">
            <p className="mb-3 inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              Featured Story
            </p>

            <h2 className="max-w-4xl text-3xl font-semibold leading-tight text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] md:text-5xl">
              {featuredArticle.title}
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
              {featuredArticle.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <p className="text-sm text-cyan-300">
                Why it matters: {featuredArticle.whyItMatters}
              </p>

              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition group-hover:bg-white/10">
                Read full story →
              </span>
            </div>
          </div>
        </Link>
{/* Daily Brief */}
<section className="mb-10">
  <div className="mb-4">
    <h3 className="text-xl font-semibold text-white">Top Signals Today</h3>
    <p className="text-sm text-gray-500">
      Most relevant developments across AI right now
    </p>
  </div>

  <div className="space-y-4">
    {topSignals.map((article, index) => (
      <div
        key={article.id}
        className="group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-purple-400/40 hover:bg-white/[0.05]"
      >
        <div className="flex gap-4">
          <span className="text-lg font-semibold text-purple-300">
            {index + 1}
          </span>

          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-gray-500">
              {article.source}
            </p>
            <h4 className="text-sm font-medium leading-6 text-white transition group-hover:text-purple-300">
              {article.title}
            </h4>
          </div>
        </div>

        <a
          href={article.link}
          target="_blank"
          rel="noreferrer"
          onClick={() => markAsRead(article.id)}
          className="shrink-0 text-xs text-gray-400 transition hover:text-white"
        >
          Read →
        </a>
      </div>
    ))}
  </div>
</section>
        {/* Section header */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Latest Signals
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Real AI news pulled from live feeds
            </p>
          </div>

          <p className="text-sm text-gray-500">
            {filteredArticles.length} article
            {filteredArticles.length !== 1 ? "s" : ""} shown
          </p>
        </div>

        {/* Cards */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <article
  key={article.id}
  className={`group relative rounded-3xl border p-5 backdrop-blur-xl transition duration-300
  ${
    readArticles.includes(article.id)
      ? "border-white/5 bg-white/[0.02] opacity-60"
      : "border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]"
  }
`}
>
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 transition group-hover:opacity-100" />

                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-purple-300">
                    {article.category || "AI News"}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{article.date}</span>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(article.id)}
                      className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm leading-none text-yellow-300 transition hover:scale-110 hover:border-yellow-400/40 hover:bg-yellow-500/10"
                      aria-label={
                        bookmarks.includes(article.id)
                          ? "Remove bookmark"
                          : "Add bookmark"
                      }
                    >
                      {bookmarks.includes(article.id) ? "★" : "☆"}
                    </button>
                  </div>
                </div>

                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                  {article.source}
                </p>

                <h4 className="mb-3 text-lg font-semibold leading-7 text-white transition duration-300 group-hover:text-purple-300">
                  {article.title}
                </h4>

                <p className="mb-4 text-sm leading-6 text-gray-400">
                  {truncateText(article.summary, 220)}
                </p>

                <p className="mb-5 text-xs leading-5 text-cyan-300">
                  Why it matters: {getWhyItMatters(article.title)}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Live feed</span>

                  <a
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => markAsRead(article.id)}
                  className="font-medium text-gray-400 transition hover:text-white"
                >
                  Read →
                </a>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
              <p className="text-lg font-medium text-white">No results found</p>
              <p className="mt-2 text-sm text-gray-400">
                Try another keyword, company name, topic, or source.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}