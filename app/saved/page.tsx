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
      <main className="min-h-screen">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-20">
          <p className="text-sm text-stone-400">Loading saved articles...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone-400">
              Your Collection
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
              Saved Articles
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              {savedArticles.length} saved article
              {savedArticles.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[#D5CEC5] bg-[#F7F4F0] px-4 py-2.5 text-sm text-stone-600 transition-colors duration-150 hover:border-[#C8C0B5] hover:text-stone-900"
            >
              ← Back to Home
            </Link>

            <input
              type="text"
              placeholder="Search saved articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#D5CEC5] bg-[#F7F4F0] px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-indigo-300 md:w-80"
            />
          </div>
        </div>

        {savedArticles.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {savedArticles.map((article) => (
              <article
                key={article.id}
                className="group rounded-2xl border border-[#E0D9CF] bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-150 hover:border-[#C8C0B5] hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-indigo-600">
                      {article.category || "AI News"}
                    </span>
                    <span className="text-xs text-stone-400">{article.date}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(article.id)}
                    className="cursor-pointer rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-sm leading-none text-amber-600 transition-colors duration-150 hover:bg-amber-100"
                    aria-label="Remove bookmark"
                  >
                    ★
                  </button>
                </div>

                <p className="mb-1.5 text-xs uppercase tracking-[0.15em] text-stone-400">
                  {article.source}
                </p>

                <h2 className="mb-3 text-[0.9375rem] font-semibold leading-[1.5] text-stone-900 transition-colors duration-150 group-hover:text-indigo-700">
                  {article.title}
                </h2>

                <p className="mb-4 text-sm leading-6 text-stone-500">
                  {truncateText(article.summary, 220)}
                </p>

                <div className="flex items-center justify-between border-t border-[#EDE8E2] pt-3 text-xs text-stone-400">
                  <span>Saved signal</span>
                  <Link
                    href={`/article/${article.id}`}
                    className="font-medium transition-colors duration-150 hover:text-indigo-700"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-[#E0D9CF] bg-[#F7F4F0] p-10 text-center">
            <p className="text-lg font-medium text-stone-900">
              {search.trim() === ""
                ? "No saved articles yet"
                : "No matching saved articles"}
            </p>
            <p className="mt-2 text-sm text-stone-500">
              {search.trim() === ""
                ? "Bookmark articles from the homepage and they will appear here."
                : "Try another keyword or clear your search."}
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-full border border-indigo-600 bg-indigo-600 px-5 py-2 text-sm text-white transition-colors duration-150 hover:bg-indigo-700"
            >
              Explore articles
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
