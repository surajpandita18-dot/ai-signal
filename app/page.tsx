"use client";

import { useEffect, useMemo, useState } from "react";
import { articles } from "@/lib/mockData";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const categories = [
    "All",
    "Models",
    "Funding",
    "Research",
    "Product",
    "Policy",
    "Dev Tools",
  ];

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

  const featuredArticle = useMemo(() => {
  if (selectedCategory === "All") return articles[0];

  const match = articles.find(
    (article) => article.category === selectedCategory
  );

  return match || articles[0];
}, [selectedCategory]);
  const query = search.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    return articles.slice(1).filter((article) => {
      const matchesSearch =
        query === "" ||
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [query, selectedCategory]);

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
              <a
                href="/saved"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Saved
                <span className="ml-2 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-200">
                  {bookmarks.length}
                </span>
              </a>

              <input
                type="text"
                placeholder="Search AI news..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none backdrop-blur-md md:w-80"
              />
            </div>
          </div>

          {/* Category Tabs */}
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
          </div>
        </header>

        {/* Hero Section */}
        <a
  href={`/article/${featuredArticle.id}`}
  className="group relative mb-10 block overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-700/40 via-zinc-900 to-blue-700/30 shadow-2xl transition hover:border-white/20"
>
  <div className="absolute inset-0">
    <img
      src={featuredArticle.image}
      alt={featuredArticle.title}
      onError={(e) => {
        e.currentTarget.src =
          "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop";
      }}
      className="h-full w-full object-cover opacity-35 transition duration-500 group-hover:scale-105"
    />
  </div>

  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

  <div className="relative z-10 p-8 md:p-10">
    <p className="mb-3 inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
      Featured Story
    </p>

    <h2 className="max-w-4xl text-3xl font-semibold leading-tight md:text-5xl text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
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
</a>

        {/* Section Heading */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Latest Signals
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Sharp summaries of the most important AI updates
            </p>
          </div>

          <p className="text-sm text-gray-500">
            {filteredArticles.length} article
            {filteredArticles.length !== 1 ? "s" : ""} shown
          </p>
        </div>

        {/* Articles Grid */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <article
  key={article.id}
  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:bg-white/[0.08] hover:bg-white/[0.08]"
>
  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 transition group-hover:opacity-100" />

  {/* Image */}
  <div className="mb-4 overflow-hidden rounded-2xl">
    <img
      src={article.image}
      alt={article.title}
      onError={(e) => {
        e.currentTarget.src =
          "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop";
      }}
      className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
    />
  </div>

  {/* Top Row */}
  <div className="mb-3 flex items-center justify-between gap-3">
    <p className="truncate text-xs uppercase tracking-[0.2em] text-gray-500">
      {article.source}
    </p>

    <div className="flex items-center gap-2">
      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-medium text-cyan-300">
        {article.category}
      </span>

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

  {/* Title */}
  <h4 className="mb-3 line-clamp-2 text-lg font-semibold leading-7 text-white transition duration-300 group-hover:text-purple-300">
    {article.title}
  </h4>

  {/* Summary */}
  <p className="mb-4 line-clamp-3 text-sm leading-6 text-gray-300">
    {article.summary}
  </p>

  {/* Why it matters */}
  <p className="mb-5 line-clamp-2 text-sm text-purple-300">
    Why it matters: {article.whyItMatters}
  </p>

  {/* Footer */}
  <div className="flex items-center justify-between text-xs text-gray-500">
    <span>{article.date}</span>
    <a
      href={`/article/${article.id}`}
      className="font-medium transition group-hover:text-white"
    >
      Read more →
    </a>
  </div>
</article>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
              <p className="text-lg font-medium text-white">No results found</p>
              <p className="mt-2 text-sm text-gray-400">
                Try another keyword, company name, topic, or category.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}