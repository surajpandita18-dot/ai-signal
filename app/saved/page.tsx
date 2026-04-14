"use client";

import { useEffect, useMemo, useState } from "react";
import { articles } from "@/lib/mockData";

export default function SavedPage() {
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarks");

    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setBookmarks(Array.isArray(parsed) ? parsed : []);
      } catch {
        setBookmarks([]);
      }
    } else {
      setBookmarks([]);
    }

    setIsLoaded(true);
  }, []);

  const toggleBookmark = (id: number) => {
    const updatedBookmarks = bookmarks.includes(id)
      ? bookmarks.filter((item) => item !== id)
      : [...bookmarks, id];

    setBookmarks(updatedBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
  };

  const savedArticles = useMemo(() => {
    return articles.filter((article) => bookmarks.includes(article.id));
  }, [bookmarks]);

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
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            ← Back to Home
          </a>
        </div>

        {savedArticles.length > 0 ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {savedArticles.map((article) => (
              <article
                key={article.id}
                className="group relative rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-purple-400/30 hover:bg-white/[0.08]"
              >
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 transition group-hover:opacity-100" />

                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    {article.source}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-medium text-cyan-300">
                      {article.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(article.id)}
                      className="cursor-pointer text-lg leading-none text-yellow-300 transition hover:scale-110"
                      aria-label="Remove bookmark"
                    >
                      ★
                    </button>
                  </div>
                </div>

                <h2 className="mb-3 text-lg font-semibold leading-7 text-white transition duration-300 group-hover:text-purple-300">
                  {article.title}
                </h2>

                <p className="mb-4 text-sm leading-6 text-gray-300">
                  {article.summary}
                </p>

                <p className="mb-4 text-sm text-purple-300">
                  Why it matters: {article.whyItMatters}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.date}</span>
                  <a
                    href={`/article/${article.id}`}
                    className="transition group-hover:text-white"
                  >
                    Read more →
                  </a>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
            <p className="text-lg font-medium text-white">
              No saved articles yet
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Bookmark articles from the homepage and they will appear here.
            </p>

            <a
              href="/"
              className="mt-6 inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-5 py-2 text-sm text-purple-200 transition hover:bg-purple-500/20"
            >
              Explore articles
            </a>
          </div>
        )}
      </div>
    </main>
  );
}