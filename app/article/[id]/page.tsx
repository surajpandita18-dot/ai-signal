"use client";

import { useEffect, useMemo, useState } from "react";
import { articles } from "@/lib/mockData";

type ArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ArticlePage({ params }: ArticlePageProps) {
  const [articleId, setArticleId] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setArticleId(Number(resolvedParams.id));
    }

    loadParams();
  }, [params]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarks");
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (id: number) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const article = useMemo(() => {
    if (articleId === null) return null;
    return articles.find((a) => a.id === articleId) ?? null;
  }, [articleId]);

  if (articleId === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-gray-400">Loading article...</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-gray-400">Article not found</p>
      </main>
    );
  }

  const isBookmarked = bookmarks.includes(article.id);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Top Actions */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <a
            href="/"
            className="inline-flex items-center text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to home
          </a>

          <button
            type="button"
            onClick={() => toggleBookmark(article.id)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            {isBookmarked ? "★ Saved" : "☆ Save article"}
          </button>
        </div>

        {/* Hero Image */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10">
          <img
            src={article.image}
            alt={article.title}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop";
            }}
            className="h-[280px] w-full object-cover md:h-[420px]"
          />
        </div>

        {/* Meta + Title */}
        <section className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-500">
            <span>{article.source}</span>
            <span>•</span>
            <span>{article.date}</span>
            <span>•</span>
            <span className="text-purple-400">{article.category}</span>
          </div>

          <h1 className="max-w-5xl text-3xl font-semibold leading-tight md:text-6xl">
            {article.title}
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 md:text-lg">
            {article.summary}
          </p>
        </section>

        {/* Why it matters */}
        <section className="mb-8 rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-6 md:p-8">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-purple-300">
            Why it matters
          </p>
          <p className="max-w-3xl text-base leading-7 text-purple-100 md:text-lg">
            {article.whyItMatters}
          </p>
        </section>

        {/* Article Body */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
          <h2 className="mb-5 text-xl font-semibold text-white md:text-2xl">
            Full Context
          </h2>

          <div className="space-y-6 text-sm leading-8 text-gray-300 md:text-base">
            <p>
              This article reflects an important shift in the AI landscape.
              Beyond the headline itself, it signals how quickly the ecosystem
              is evolving across model capabilities, product experience,
              developer tooling, and commercial adoption.
            </p>

            <p>
              For operators, founders, and product teams, the real value lies in
              understanding what this update means in practice. It may influence
              how new AI features are built, how workflows are automated, how
              trust and usability are designed, and how users interact with AI
              products day to day.
            </p>

            <p>
              The strongest teams will not just track announcements. They will
              connect them to user behavior, product opportunities, market
              timing, and implementation quality. That is often where the real
              edge comes from.
            </p>

            <p>
              As the AI space matures, thoughtful execution will matter more
              than novelty alone. Products that combine clarity, performance,
              reliability, and strong UX will stand out in a crowded ecosystem.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}