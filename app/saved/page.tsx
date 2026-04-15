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
  if (!text) return "No summary available.";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + "…";
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
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-20">
          <p className="text-sm text-gray-400">Loading saved articles...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              Your Collection
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Saved Articles
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              {savedArticles.length} saved article
              {savedArticles.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              ← Back to Home
            </Link>

            <input
              type="text"
              placeholder="Search saved articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none backdrop-blur-md md:w-80"
            />
          </div>
        </div>

        {savedArticles.length > 0 ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {savedArticles.map((article) => (
              <article
                key={article.id}
                className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]"
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
                      aria-label="Remove bookmark"
                    >
                      ★
                    </button>
                  </div>
                </div>

                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                  {article.source}
                </p>

                <h2 className="mb-3 text-lg font-semibold leading-7 text-white transition duration-300 group-hover:text-purple-300">
                  {article.title}
                </h2>

                <p className="mb-5 text-sm leading-6 text-gray-400">
                  {truncateText(article.summary, 220)}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Saved signal</span>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-gray-400 transition hover:text-white"
                  >
                    Read →
                  </a>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
            <p className="text-lg font-medium text-white">
              {search.trim() === ""
                ? "No saved articles yet"
                : "No matching saved articles"}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              {search.trim() === ""
                ? "Bookmark articles from the homepage and they will appear here."
                : "Try another keyword or clear your search."}
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-5 py-2 text-sm text-purple-200 transition hover:bg-purple-500/20"
            >
              Explore articles
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}