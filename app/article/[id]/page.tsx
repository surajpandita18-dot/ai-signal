"use client";

import { useEffect, useState } from "react";
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

  if (articleId === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-gray-400">Loading article...</p>
      </div>
    );
  }

  const article = articles.find((a) => a.id === articleId);

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Article not found</p>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(article.id);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Top Actions */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="/"
            className="inline-block text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to home
          </a>

          <button
            type="button"
            onClick={() => toggleBookmark(article.id)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            {isBookmarked ? "★ Saved" : "☆ Save article"}
          </button>
        </div>

        {/* Hero Content */}
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-500">
            <span>{article.source}</span>
            <span>•</span>
            <span>{article.date}</span>
            <span>•</span>
            <span className="text-purple-400">{article.category}</span>
          </div>

          <h1 className="mb-6 max-w-4xl text-3xl font-semibold leading-tight md:text-6xl">
            {article.title}
          </h1>

          <p className="max-w-3xl text-base leading-8 text-gray-300 md:text-lg">
            {article.summary}
          </p>
        </section>

        {/* Why it matters */}
        <section className="mb-8 rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-6">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-purple-300">
            Why it matters
          </p>
          <p className="text-base leading-7 text-purple-100">
            {article.whyItMatters}
          </p>
        </section>

        {/* Mock article body */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Full Context
          </h2>

          <div className="space-y-5 text-sm leading-7 text-gray-300 md:text-base">
            <p>
              This article highlights an important development in the AI
              ecosystem. The update reflects how quickly the space is moving
              across product launches, model capabilities, business adoption,
              and infrastructure.
            </p>

            <p>
              For builders, operators, and product teams, the key takeaway is
              not just the headline itself, but what it signals about where the
              market is heading next. Stronger AI products are increasingly
              combining usability, reliability, and integration into real
              workflows.
            </p>

            <p>
              As this landscape evolves, teams that understand both the surface
              narrative and the deeper product implications will be better
              positioned to identify opportunities, build differentiated
              experiences, and respond faster to changes in the ecosystem.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}